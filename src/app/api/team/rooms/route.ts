import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/team/rooms
 * Lista todas as salas do usuário autenticado com detalhes
 * Evita depender da view (problemas de permissão no Supabase)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Busca memberships do usuário atual
    const { data: memberships, error: memErr } = await (supabase as any)
      .from('team_room_members')
      .select('room_id, last_read_at')
      .eq('user_id', user.id);

    if (memErr) {
      console.error('[team/rooms GET] memberships', memErr);
      return NextResponse.json({ error: memErr.message }, { status: 500 });
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    const roomIds: string[] = memberships.map((m: any) => m.room_id);
    const lastReadByRoom: Record<string, string> = {};
    for (const m of memberships) lastReadByRoom[m.room_id] = m.last_read_at;

    // 2. Busca salas
    const { data: rooms, error: roomErr } = await (supabase as any)
      .from('team_rooms')
      .select('id, type, name, created_by, created_at, updated_at')
      .in('id', roomIds)
      .order('updated_at', { ascending: false });

    if (roomErr) {
      console.error('[team/rooms GET] rooms', roomErr);
      return NextResponse.json({ error: roomErr.message }, { status: 500 });
    }

    // 3. Busca todos os membros dessas salas
    // Usa cliente admin (service_role) pois RLS filtraria apenas as linhas do
    // próprio usuário, ocultando o outro membro — fazendo other_user = null.
    const admin = createAdminClient();
    const { data: allMembers } = await (admin as any)
      .from('team_room_members')
      .select('room_id, user_id, last_read_at')
      .in('room_id', roomIds);

    // Busca perfis de todos os membros em batch (FK é para auth.users, não user_profiles)
    const allUserIds = [...new Set((allMembers ?? []).map((m: any) => m.user_id))] as string[];
    const { data: allProfiles } = allUserIds.length
      ? await (admin as any)
          .from('user_profiles')
          .select('id, full_name, avatar_url, role')
          .in('id', allUserIds)
      : { data: [] };
    const profileMap: Record<string, any> = {};
    for (const p of allProfiles ?? []) profileMap[p.id] = p;

    const membersByRoom: Record<string, any[]> = {};
    for (const m of allMembers ?? []) {
      if (!membersByRoom[m.room_id]) membersByRoom[m.room_id] = [];
      membersByRoom[m.room_id].push({ ...m, user_profiles: profileMap[m.user_id] ?? null });
    }

    // 4. Busca última mensagem de cada sala
    const lastMsgPromises = roomIds.map((rid: string) =>
      (supabase as any)
        .from('team_messages')
        .select('room_id, content, created_at, sender_id')
        .eq('room_id', rid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    );
    const lastMsgResults = await Promise.all(lastMsgPromises);
    const lastMsgByRoom: Record<string, any> = {};
    lastMsgResults.forEach(({ data }) => {
      if (data) lastMsgByRoom[data.room_id] = data;
    });

    // 5. Calcula unread_count por sala
    const unreadPromises = roomIds.map((rid: string) => {
      const since = lastReadByRoom[rid];
      return (supabase as any)
        .from('team_messages')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', rid)
        .neq('sender_id', user.id)
        .gt('created_at', since);
    });
    const unreadResults = await Promise.all(unreadPromises);
    const unreadByRoom: Record<string, number> = {};
    roomIds.forEach((rid: string, i: number) => {
      unreadByRoom[rid] = unreadResults[i].count ?? 0;
    });

    // 6. Monta resposta enriquecida
    const enriched = (rooms ?? []).map((room: any) => {
      const members = membersByRoom[room.id] ?? [];
      const lm = lastMsgByRoom[room.id] ?? null;
      const base = {
        ...room,
        last_message_content: lm?.content ?? null,
        last_message_at: lm?.created_at ?? null,
        last_message_sender_id: lm?.sender_id ?? null,
        last_read_at: lastReadByRoom[room.id],
        unread_count: unreadByRoom[room.id] ?? 0,
        members,
      };
      if (room.type === 'direct') {
        const other = members.find((m: any) => m.user_id !== user.id);
        return { ...base, other_user: other?.user_profiles ?? null };
      }
      return base;
    });

    return NextResponse.json({ rooms: enriched });
  } catch (err: any) {
    console.error('[team/rooms GET] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/team/rooms
 * Cria (ou retorna existente) sala DM com outro usuário
 * Body: { target_user_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { target_user_id } = body;

    if (!target_user_id || typeof target_user_id !== 'string') {
      return NextResponse.json({ error: 'target_user_id is required' }, { status: 400 });
    }

    if (target_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot create DM with yourself' }, { status: 400 });
    }

    // Verifica se o usuário alvo existe na organização
    const { data: targetProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('id, full_name')
      .eq('id', target_user_id)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Usa a função PostgreSQL para criar ou reutilizar sala DM
    const { data, error } = await (supabase as any)
      .rpc('get_or_create_direct_room', {
        user_a: user.id,
        user_b: target_user_id,
      });

    if (error) {
      console.error('[team/rooms POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ room_id: data }, { status: 201 });
  } catch (err: any) {
    console.error('[team/rooms POST] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
