import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/team/users
 * Lista todos os usuários da organização (para selecionar quem iniciar DM)
 * Query: ?q=nome (busca por nome)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get('q') ?? '';

    let query = (supabase as any)
      .from('user_profiles')
      .select('id, full_name, avatar_url, role')
      .neq('id', user.id)      // exclui o próprio usuário
      .order('full_name');

    if (q.trim().length > 0) {
      query = query.ilike('full_name', `%${q.trim()}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('[team/users GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: users ?? [] });
  } catch (err: any) {
    console.error('[team/users GET] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
