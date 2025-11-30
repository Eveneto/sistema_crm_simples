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
    // Filtrar por usuário autenticado OU conversas sem atribuição (assigned_to IS NULL)
    const { data: conversations, error: conversationsError } = await supabase
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
      .or(`assigned_to.eq.${user.id},assigned_to.is.null`) // Conversas do usuário OU sem atribuição
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(100);

    console.log('[DEBUG] Conversations fetched:', {
      count: conversations?.length,
      userId: user.id,
      error: conversationsError
    });

    if (conversationsError) {
      console.error('[DEBUG] Error fetching conversations:', conversationsError);
      return NextResponse.json([], { status: 200 }); // Retornar array vazio se tiver erro
    }

    return NextResponse.json(conversations || []);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conversas', details: String(error) },
      { status: 500 }
    );
  }
}
