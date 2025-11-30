/**
 * POST /api/conversations/create
 * Cria uma nova conversa com um contato
 * 
 * Body:
 * - contact_id: uuid do contato
 * - channel_id: opcional (padrão: 'whatsapp')
 * 
 * Response:
 * - conversation: objeto conversa criado
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contact_id, channel_type = 'whatsapp' } = body;

    // Validações
    if (!contact_id) {
      return NextResponse.json(
        { error: 'contact_id é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se contato existe
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('id', contact_id)
      .single() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Obter channel_id baseado no tipo (whatsapp, telegram, etc)
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('type', channel_type)
      .single() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (channelError || !channel) {
      return NextResponse.json(
        { error: `Canal '${channel_type}' não encontrado`, details: 'Crie um canal primeiro' },
        { status: 404 }
      );
    }

    // Verificar se conversa já existe para este contato+canal
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contact_id)
      .eq('channel_id', channel.id)
      .single();

    // Se já existe, retornar
    if (existingConversation) {
      return NextResponse.json(
        { message: 'Conversa já existe', conversation: existingConversation },
        { status: 200 }
      );
    }

    // Criar nova conversa
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        contact_id,
        channel_id: channel.id, // Usar UUID do channel encontrado
        assigned_to: user.id, // Atribuir ao usuário atual
        status: 'open',
        unread_count: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select('id, contact_id, channel_id, assigned_to, status, created_at')
      .single();

    if (insertError) {
      logger.error('Error creating conversation', { error: insertError });
      return NextResponse.json(
        { error: 'Erro ao criar conversa', details: insertError.message },
        { status: 500 }
      );
    }

    logger.info('Conversation created', {
      conversationId: (newConversation as any)?.id, // eslint-disable-line @typescript-eslint/no-explicit-any
      contactId: contact_id,
      userId: user.id,
    });

    return NextResponse.json(
      {
        message: 'Conversa criada com sucesso',
        conversation: {
          ...newConversation,
          contact: {
            id: (contact as any)?.id, // eslint-disable-line @typescript-eslint/no-explicit-any
            name: (contact as any)?.name, // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Unexpected error creating conversation', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
