import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validação de token webhook
const WEBHOOK_TOKEN = process.env.EVOLUTION_WEBHOOK_TOKEN || 'your_webhook_token_change_this';

// Criar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Esquema de validação para mensagens
const MessageSchema = z.object({
  messageTimestamp: z.number().optional(),
  messageType: z.enum(['text', 'media', 'button', 'list', 'template']),
  textMessage: z
    .object({
      text: z.string(),
    })
    .optional(),
  mediaMessage: z
    .object({
      mediaType: z.enum(['image', 'video', 'audio', 'document']),
      mediaUrl: z.string().url(),
      caption: z.string().optional(),
    })
    .optional(),
  fromMe: z.boolean(),
  sender: z.object({
    id: z.string(),
    name: z.string().optional(),
    profilePicture: z.string().url().optional(),
  }),
  chat: z.object({
    id: z.string(),
    name: z.string().optional(),
  }),
});

// Esquema de validação para contatos
const ContactSchema = z.object({
  id: z.string(),
  pushName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  number: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

// Tipos para evolution
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MessagePayload = z.infer<typeof MessageSchema>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ContactPayload = z.infer<typeof ContactSchema>;

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  sender?: {
    id: string;
    name?: string;
  };
}

// Função para extrair número de telefone
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPhoneNumber(id: any): string {
  // Formato típico: "5511987654321@c.us" ou "5511987654321"
  return id.replace(/@.*/, '').replace(/[^\d]/g, '');
}

// Função para processar mensagens
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleMessageReceived(data: any, instanceName: string) {
  try {
    const message = MessageSchema.parse(data);
    const phoneFrom = extractPhoneNumber(message.sender.id);
    const phoneTo = extractPhoneNumber(message.chat.id);

    // 1. Criar/atualizar contato
    const contactUpsertData = {
      phone: phoneFrom,
      name: message.sender.name || 'Unknown',
      whatsapp_instance: instanceName,
      last_message_at: new Date(),
    };

    await supabase.from('contacts').upsert(contactUpsertData, {
      onConflict: 'phone',
    });

    // 2. Obter ou criar conversa
    const conversationKey = `whatsapp_${instanceName}_${phoneFrom}`;

    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('key', conversationKey)
      .single();

    let conversationId = existingConversation?.id;

    if (!conversationId) {
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          key: conversationKey,
          title: `WhatsApp - ${message.sender.name || phoneFrom}`,
          type: 'whatsapp',
          channel_type: 'whatsapp',
          metadata: {
            instance_name: instanceName,
            phone: phoneFrom,
            contact_name: message.sender.name,
            profile_picture: message.sender.profilePicture,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao criar conversa:', error);
        throw error;
      }

      conversationId = newConversation.id;
    }

    // 3. Salvar mensagem
    const messageText =
      message.textMessage?.text ||
      message.mediaMessage?.caption ||
      `[${message.messageType.toUpperCase()}]`;

    const messageData = {
      conversation_id: conversationId,
      text: messageText,
      from_number: phoneFrom,
      to_number: phoneTo,
      direction: message.fromMe ? 'outgoing' : 'incoming',
      message_type: message.messageType,
      evolution_message_id: data.id || `msg_${Date.now()}`,
      metadata: {
        media_type: message.mediaMessage?.mediaType,
        media_url: message.mediaMessage?.mediaUrl,
        timestamp: message.messageTimestamp,
      },
      created_at: new Date(message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now()),
    };

    const { error: messageError } = await supabase.from('messages').insert(messageData);

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
      throw messageError;
    }

    console.log(`✅ Mensagem salva: ${phoneFrom} -> ${messageText.substring(0, 50)}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    throw error;
  }
}

// Função para processar contatos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleContactReceived(data: any, instanceName: string) {
  try {
    const contact = ContactSchema.parse(data);
    const phone = extractPhoneNumber(contact.id);

    const contactData = {
      phone,
      name: contact.pushName || contact.name || 'Unknown',
      email: contact.email,
      whatsapp_instance: instanceName,
      metadata: {
        profile_picture: contact.profilePicture,
        evolution_id: contact.id,
      },
    };

    await supabase.from('contacts').upsert(contactData, {
      onConflict: 'phone',
    });

    console.log(`✅ Contato sincronizado: ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    throw error;
  }
}

// Função para processar status de mensagem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleMessageStatusReceived(data: any) {
  try {
    const { id, status } = data;

    await supabase
      .from('messages')
      .update({
        status: status,
        updated_at: new Date(),
      })
      .eq('evolution_message_id', id);

    console.log(`✅ Status atualizado: ${id} -> ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// POST - Receber webhooks da Evolution API
export async function POST(request: NextRequest) {
  try {
    // Validar token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.headers.get('x-webhook-token');

    if (token !== WEBHOOK_TOKEN) {
      console.warn('❌ Token webhook inválido');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, instance, data } = body as EvolutionWebhookPayload;

    console.log(`📨 Webhook recebido: ${event} (instance: ${instance})`);

    // Redirecionar para handler específico
    switch (event) {
      case 'messages.upsert':
        await handleMessageReceived(data, instance);
        break;

      case 'contacts.upsert':
        await handleContactReceived(data, instance);
        break;

      case 'messages.update':
        await handleMessageStatusReceived(data);
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${event}`);
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp webhook receiver is running',
  });
}
