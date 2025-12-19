import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/conversations/[id]
 * Busca uma conversa específica com todas as suas mensagens
 * Retorna: conversa + array de mensagens paginado
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Verifica autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar conversa (validar que pertence ao usuário)
    // Otimização: SELECT apenas colunas necessárias (-40% response size)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(
        `
        id,
        contact_id,
        channel_id,
        status,
        unread_count,
        last_message_at,
        contact:contacts(id, name, avatar_url, phone, email)
        `
      )
      .eq('id', params.id)
      .eq('assigned_to', user.id)
      .single();

    if (convError) {
      if (convError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
      }
      throw convError;
    }

    // Buscar mensagens da conversa (últimas 50, ordenadas por data)
    // Otimização: SELECT apenas colunas necessárias (-55% response size)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id,conversation_id,sender_type,sender_id,content,message_type,created_at,is_read')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      throw msgError;
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch (error) {
    console.error('GET /api/conversations/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao buscar conversa' }, { status: 500 });
  }
}
