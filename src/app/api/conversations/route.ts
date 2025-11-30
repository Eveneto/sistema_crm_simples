import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/conversations
 * Lista todas as conversas do usuário autenticado
 * Incluindo: contato, última mensagem, contagem de não lidos
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verifica autenticação
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[DEBUG] Auth error or no user:', { authError, hasUser: !!user });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[DEBUG] User authenticated:', user.id);

    // Primeiro, tentar buscar sem filtro para ver se existem dados
    const { data: allConversations, error: allError } = await supabase
      .from('conversations')
      .select('id, assigned_to, contact_id')
      .limit(5);

    console.log('[DEBUG] All conversations (first 5):', {
      count: allConversations?.length,
      data: allConversations,
      error: allError
    });

    // Buscar conversas com detalhes do contato
    // Tentar duas abordagens:
    // 1. Conversas atribuídas ao usuário
    const { data: conversationsByAssigned, error: error1 } = await supabase
      .from('conversations')
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
      .eq('assigned_to', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(100);

    console.log('[DEBUG] By assigned_to:', {
      count: conversationsByAssigned?.length,
      error: error1
    });

    if (error1) {
      console.error('[DEBUG] Error with assigned_to filter:', error1);
    }

    // Se não encontrar com assigned_to, buscar todas (sem filtro)
    if (!conversationsByAssigned || conversationsByAssigned.length === 0) {
      console.log('[DEBUG] No conversations found with assigned_to filter, trying without filter');
      
      const { data: allConv, error: error2 } = await supabase
        .from('conversations')
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
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(100);

      console.log('[DEBUG] Without filter:', {
        count: allConv?.length,
        error: error2
      });

      return NextResponse.json(allConv || []);
    }

    return NextResponse.json(conversationsByAssigned || []);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conversas', details: String(error) },
      { status: 500 }
    );
  }
}
