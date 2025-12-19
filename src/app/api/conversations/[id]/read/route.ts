import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/conversations/[id]/read
 * Marca uma conversa como lida:
 * 1. Atualiza is_read=true em todas as mensagens
 * 2. Reseta unread_count na conversa
 */
export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validar que a conversa pertence ao usuário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: convError } = (await supabase
      .from('conversations')
      .select('id')
      .eq('id', params.id)
      .eq('assigned_to', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single()) as any;

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Atualizar conversa para marcar como lida
    const updatedConversation = {
      unread_count: 0,
    };

    const response = await (supabase
      .from('conversations')
      .update(updatedConversation)
      .eq('id', params.id)
      .select(
        `
        id,
        status,
        unread_count,
        last_message_at,
        created_at,
        updated_at,
        contact:contacts(id, name, avatar_url, phone, email)
        `
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as any);

    const { data: updated, error: updateError } = response;

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw updateError;
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/conversations/[id]/read error:', error);
    return NextResponse.json({ error: 'Erro ao marcar conversa como lida' }, { status: 500 });
  }
}
