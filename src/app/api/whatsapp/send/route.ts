import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema de validação para envio de mensagem
const SendMessageSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Número de telefone inválido'),
  message: z.string().min(1).max(4096),
  instanceName: z.string().default('crm_instance'),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video', 'audio', 'document']).optional(),
  caption: z.string().optional(),
});

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
