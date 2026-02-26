/**
 * POST /api/whatsapp/send — Envia mensagem WhatsApp via Meta Cloud API
 *
 * Substitui a integração Evolution API pela Meta Graph API oficial.
 * O canal (channel) é identificado pelo channel_id ou, por padrão,
 * usa as variáveis de ambiente globais WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  sendTextMessage,
  sendMediaMessage,
} from '@/lib/services/meta-whatsapp';

// ─── Schema de validação ──────────────────────────────────────────────────────

const SendMessageSchema = z.object({
  /** Número E.164 sem "+" — ex: "5511987654321" */
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Número de telefone inválido (somente dígitos, 10-15 chars)'),
  /** Texto da mensagem (obrigatório mesmo para mídia — usado como caption fallback) */
  message: z.string().min(1).max(4096),
  /** UUID do canal configurado. Se omitido, usa variáveis de ambiente globais */
  channelId: z.string().uuid().optional(),
  /** Para mensagens de mídia */
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video', 'audio', 'document']).optional(),
  caption: z.string().max(1024).optional(),
  /** UUID da conversa existente para registrar a mensagem */
  conversationId: z.string().uuid().optional(),
});

type SendPayload = z.infer<typeof SendMessageSchema>;

// ─── Cliente de serviço (sem RLS) para operações internas ────────────────────

const serviceSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve as credenciais Meta a partir de um channelId ou das variáveis de ambiente globais.
 */
async function resolveCredentials(
  channelId?: string
): Promise<{ phoneNumberId: string; accessToken: string; channelDbId: string | null }> {
  if (channelId) {
    const { data: channel, error } = await serviceSupabase
      .from('channels')
      .select('id, meta_phone_number_id, meta_access_token')
      .eq('id', channelId)
      .single();

    if (error || !channel?.meta_phone_number_id || !channel?.meta_access_token) {
      throw new Error(
        `Canal ${channelId} não encontrado ou não configurado para Meta API.`
      );
    }

    return {
      phoneNumberId: channel.meta_phone_number_id as string,
      accessToken: channel.meta_access_token as string,
      channelDbId: channel.id as string,
    };
  }

  // Fallback: variáveis de ambiente globais
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN ?? '';

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN não estão configurados no .env.local'
    );
  }

  return { phoneNumberId, accessToken, channelDbId: null };
}

/**
 * Garante que existe uma conversa aberta para o contato + canal.
 * Cria contact e conversation se necessário.
 */
async function ensureConversation(
  phoneNumber: string,
  channelDbId: string | null,
  conversationId?: string
): Promise<string | null> {
  // Se conversationId informado, retorna direto
  if (conversationId) return conversationId;

  // Sem canal DB, não sabemos a qual conversa vincular
  if (!channelDbId) return null;

  // Upsert do contato
  const { data: contact } = await serviceSupabase
    .from('contacts')
    .upsert({ phone: phoneNumber, name: phoneNumber }, { onConflict: 'phone' })
    .select('id')
    .single();

  if (!contact) return null;

  // Buscar conversa aberta
  const { data: existing } = await serviceSupabase
    .from('conversations')
    .select('id')
    .eq('contact_id', contact.id)
    .eq('channel_id', channelDbId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing.id;

  // Criar conversa
  const { data: created } = await serviceSupabase
    .from('conversations')
    .insert({ contact_id: contact.id, channel_id: channelDbId, status: 'open' })
    .select('id')
    .single();

  return created?.id ?? null;
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação do usuário (session Supabase)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Validação do body
    const body = await request.json();
    const parsed = SendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload: SendPayload = parsed.data;

    console.log(`[whatsapp/send] 📤 Enviando para ${payload.phoneNumber}`);

    // 3. Resolver credenciais Meta
    const { phoneNumberId, accessToken, channelDbId } = await resolveCredentials(
      payload.channelId
    );

    // 4. Enviar via Meta Graph API
    let wamid: string;

    if (payload.mediaUrl && payload.mediaType) {
      wamid = await sendMediaMessage(
        {
          to: payload.phoneNumber,
          type: payload.mediaType,
          link: payload.mediaUrl,
          caption: payload.caption ?? payload.message,
        },
        { phoneNumberId, accessToken }
      );
    } else {
      wamid = await sendTextMessage(
        { to: payload.phoneNumber, body: payload.message },
        { phoneNumberId, accessToken }
      );
    }

    console.log(`[whatsapp/send] ✅ Mensagem enviada — wamid: ${wamid}`);

    // 5. Persistir mensagem no banco
    const convId = await ensureConversation(
      payload.phoneNumber,
      channelDbId,
      payload.conversationId
    );

    if (convId) {
      const contentText = payload.mediaUrl
        ? `[${payload.mediaType?.toUpperCase()}] ${payload.caption ?? payload.message}`
        : payload.message;

      await serviceSupabase.from('messages').insert({
        conversation_id: convId,
        sender_type: 'user',
        sender_id: user.id,
        content: contentText,
        media_url: payload.mediaUrl ?? null,
        message_type: payload.mediaType ?? 'text',
        whatsapp_message_id: wamid,
        is_read: true,
      });

      // Atualizar last_message_at da conversa
      await serviceSupabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convId);
    }

    return NextResponse.json({ success: true, wamid, conversationId: convId }, { status: 200 });
  } catch (error) {
    console.error('[whatsapp/send] Erro:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}

// ─── GET — health check ───────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'meta-cloud-api',
    apiVersion: process.env.WHATSAPP_API_VERSION ?? 'v19.0',
  });
}

type SendMessagePayload = z.infer<typeof SendMessageSchema>;

// Criar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Função para enviar mensagem via Evolution API
async function sendViaEvolutionAPI(
  phoneNumber: string,
  payload: SendMessagePayload
): Promise<{ id: string; status: string }> {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const instanceName = payload.instanceName;

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw new Error('Evolution API não está configurada');
  }

  // Formatar número: adicionar país (BR) se não tiver
  let formattedPhone = phoneNumber;
  if (phoneNumber.length === 11) {
    formattedPhone = `55${phoneNumber}`;
  }

  // Endpoint da Evolution API
  const endpoint = `${evolutionApiUrl}/message/sendText/${instanceName}`;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${evolutionApiKey}`,
    'X-API-Key': evolutionApiKey,
  };

  try {
    // Se tiver media, usar endpoint de media
    if (payload.mediaUrl && payload.mediaType) {
      const mediaEndpoint = `${evolutionApiUrl}/message/sendMedia/${instanceName}`;

      const mediaPayload = {
        number: formattedPhone,
        mediaMessage: {
          mediatype: payload.mediaType,
          caption: payload.caption || payload.message,
          media: payload.mediaUrl,
        },
      };

      const response = await fetch(mediaEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(mediaPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro Evolution API: ${response.status} - ${error}`);
      }

      return await response.json();
    }

    // Enviar mensagem de texto
    const textPayload = {
      number: formattedPhone,
      text: payload.message,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(textPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro Evolution API: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar via Evolution API:', error);
    throw error;
  }
}

// POST - Enviar mensagem WhatsApp
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação (verificar se é usuário autenticado)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse do corpo
    const body = await request.json();
    const payload = SendMessageSchema.parse(body);

    console.log(`📤 Enviando mensagem para ${payload.phoneNumber}`);

    // Enviar via Evolution API
    const result = await sendViaEvolutionAPI(payload.phoneNumber, payload);

    // Salvar no banco como mensagem enviada
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('key', `whatsapp_${payload.instanceName}_${payload.phoneNumber}`)
      .single();

    if (conversations) {
      await supabase.from('messages').insert({
        conversation_id: conversations.id,
        text: payload.mediaUrl
          ? `[${payload.mediaType?.toUpperCase()}] ${payload.caption || payload.message}`
          : payload.message,
        from_number: 'system',
        to_number: payload.phoneNumber,
        direction: 'outgoing',
        message_type: payload.mediaType ? 'media' : 'text',
        status: 'sent',
        evolution_message_id: result.id,
        metadata: {
          media_type: payload.mediaType,
          media_url: payload.mediaUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
      status: result.status,
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp send API is running',
  });
}
