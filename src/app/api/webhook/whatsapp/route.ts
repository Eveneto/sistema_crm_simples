/**
 * /api/webhook/whatsapp — Meta WhatsApp Cloud API Webhook
 *
 * GET  — Verificação do webhook (hub.challenge) exigida pela Meta ao registrar a URL
 * POST — Recebe eventos de mensagem/status, valida assinatura HMAC-SHA256 e persiste no Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyWebhookSignature,
  verifyWebhookChallenge,
  parseWebhookPayload,
  type MetaWebhookPayload,
  type NormalizedMessage,
  type NormalizedStatus,
} from '@/lib/services/meta-whatsapp';

// ─── Cliente Supabase com permissões de serviço ───────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determina o content-type da mensagem a partir do tipo Meta.
 * Mapeia para os valores aceitos pelo CHECK constraint da tabela messages.
 */
function toMessageType(
  metaType: NormalizedMessage['type']
): 'text' | 'image' | 'video' | 'audio' | 'document' {
  switch (metaType) {
    case 'image':    return 'image';
    case 'video':    return 'video';
    case 'audio':    return 'audio';
    case 'document': return 'document';
    default:         return 'text';
  }
}

// ─── Handlers de domínio ──────────────────────────────────────────────────────

/**
 * Processa mensagens recebidas:
 * 1. Busca o channel pelo phone_number_id
 * 2. Upsert do contato pelo número de telefone
 * 3. Obtém ou cria a conversa (contact_id + channel_id)
 * 4. Insere a mensagem
 * 5. Atualiza last_message_at e unread_count na conversa
 */
async function handleMessages(messages: NormalizedMessage[]): Promise<void> {
  for (const msg of messages) {
    try {
      // 1. Buscar channel pelo phone_number_id (criado pela migration A1)
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('meta_phone_number_id', msg.phoneNumberId)
        .single();

      if (channelError || !channel) {
        console.warn(
          `[webhook] Canal não encontrado para phone_number_id=${msg.phoneNumberId}. ` +
          'Configure o canal em Configurações > Canais.'
        );
        continue;
      }

      // 2. Upsert do contato pelo número de telefone
      const contactPhone = msg.from;
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .upsert(
          {
            phone: contactPhone,
            name: msg.fromName || contactPhone,
          },
          { onConflict: 'phone', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      if (contactError || !contact) {
        console.error('[webhook] Erro ao upsert contato:', contactError);
        continue;
      }

      // 3. Obter ou criar a conversa (contact_id + channel_id = identificador único)
      let conversationId: string;

      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('contact_id', contact.id)
        .eq('channel_id', channel.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: created, error: createError } = await supabase
          .from('conversations')
          .insert({
            contact_id: contact.id,
            channel_id: channel.id,
            status: 'open',
          })
          .select('id')
          .single();

        if (createError || !created) {
          console.error('[webhook] Erro ao criar conversa:', createError);
          continue;
        }
        conversationId = created.id;
      }

      // 4. Inserir mensagem (sender_type = 'contact', pois veio do cliente)
      const contentText =
        msg.text ?? (msg.type !== 'text' ? `[${msg.type.toUpperCase()}]` : '');

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'contact',
        sender_id: contact.id,
        content: contentText,
        media_url: null,          // URL de mídia resolvida sob demanda via getMediaUrl()
        message_type: toMessageType(msg.type),
        whatsapp_message_id: msg.wamid,
        is_read: false,
        created_at: msg.timestamp.toISOString(),
      });

      if (msgError) {
        console.error('[webhook] Erro ao inserir mensagem:', msgError);
        continue;
      }

      // 5. Atualizar last_message_at e incrementar unread_count na conversa
      await supabase.rpc('increment_unread_count', { conv_id: conversationId }).catch(() => {
        // RPC opcional — se não existir, faz update direto
      });

      await supabase
        .from('conversations')
        .update({
          last_message_at: msg.timestamp.toISOString(),
          unread_count: supabase.rpc ? undefined : undefined, // gerenciado pelo trigger ou RPC acima
        })
        .eq('id', conversationId);

      console.log(`[webhook] ✅ Mensagem salva: ${msg.from} → "${contentText.substring(0, 60)}"`);
    } catch (err) {
      console.error('[webhook] Erro inesperado ao processar mensagem:', err);
    }
  }
}

/**
 * Atualiza o status de mensagens enviadas (sent → delivered → read / failed).
 * Usa o wamid como chave, que foi salvo em messages.whatsapp_message_id.
 */
async function handleStatuses(statuses: NormalizedStatus[]): Promise<void> {
  for (const status of statuses) {
    // A tabela messages não tem coluna "status" no schema original.
    // Registramos no custom_fields da conversa ou simplesmente logamos.
    // Quando a coluna for adicionada numa migration futura, descomentar o update abaixo.
    console.log(
      `[webhook] Status ${status.status} para wamid=${status.wamid} (${status.recipientId})`
    );

    // Futura coluna messages.delivery_status:
    // await supabase
    //   .from('messages')
    //   .update({ delivery_status: status.status })
    //   .eq('whatsapp_message_id', status.wamid);
  }
}

// ─── Rotas HTTP ───────────────────────────────────────────────────────────────

/**
 * GET /api/webhook/whatsapp
 *
 * A Meta faz uma requisição GET para verificar a URL do webhook ao cadastrá-la
 * no painel Meta for Developers. Precisamos responder com hub.challenge se o
 * hub.verify_token bater com WHATSAPP_VERIFY_TOKEN do .env.
 *
 * Query params enviados pela Meta:
 *   hub.mode        = "subscribe"
 *   hub.verify_token = <o token que você definiu>
 *   hub.challenge   = <string aleatória que deve ser devolvida>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode      = searchParams.get('hub.mode') ?? '';
  const token     = searchParams.get('hub.verify_token') ?? '';
  const challenge = searchParams.get('hub.challenge') ?? '';

  const result = verifyWebhookChallenge(mode, token, challenge);

  if (result !== null) {
    console.log('[webhook] ✅ Verificação do webhook Meta bem-sucedida.');
    // A Meta espera receber apenas o challenge como texto plano com status 200
    return new NextResponse(result, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  console.warn('[webhook] ❌ Falha na verificação — token inválido ou mode incorreto.');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST /api/webhook/whatsapp
 *
 * Recebe notificações da Meta (mensagens, status, erros).
 * 1. Lê o body como Buffer para calcular o HMAC antes de parsear o JSON
 * 2. Valida X-Hub-Signature-256
 * 3. Parseia e normaliza o payload
 * 4. Persiste no Supabase
 */
export async function POST(request: NextRequest) {
  // 1. Ler body cru (necessário para validação HMAC)
  const rawBuffer = Buffer.from(await request.arrayBuffer());

  // 2. Validar assinatura HMAC-SHA256
  const signature = request.headers.get('x-hub-signature-256') ?? '';
  const isValid = verifyWebhookSignature(rawBuffer, signature);

  if (!isValid) {
    console.warn('[webhook] ❌ Assinatura HMAC inválida — requisição rejeitada.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Parsear JSON
  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBuffer.toString('utf-8')) as MetaWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // A Meta só envia webhooks para o objeto 'whatsapp_business_account'
  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  console.log(
    `[webhook] 📨 Recebido — entries: ${payload.entry?.length ?? 0}`
  );

  // 4. Normalizar payload
  const { messages, statuses } = parseWebhookPayload(payload);

  // 5. Processar em paralelo (mensagens e status são independentes)
  await Promise.all([
    messages.length  > 0 ? handleMessages(messages)   : Promise.resolve(),
    statuses.length  > 0 ? handleStatuses(statuses)   : Promise.resolve(),
  ]);

  // A Meta exige sempre HTTP 200 como acknowledge, caso contrário reenvia
  return NextResponse.json({ received: true }, { status: 200 });
}
