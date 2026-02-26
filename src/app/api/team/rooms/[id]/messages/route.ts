import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAGE_SIZE = 50;

/**
 * GET /api/team/rooms/[id]/messages
 * Histórico de mensagens com paginação via cursor (before=<iso_date>)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    const before = request.nextUrl.searchParams.get('before'); // cursor ISO

    // Verifica que o usuário é membro da sala (RLS cobre, mas melhor ser explícito)
    const { data: membership } = await (supabase as any)
      .from('team_room_members')
      .select('room_id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Busca mensagens (sem foreign key hint — funciona sempre)
    let query = (supabase as any)
      .from('team_messages')
      .select('id, room_id, sender_id, content, message_type, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE + 1);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('[team/messages GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const has_more = (rows?.length ?? 0) > PAGE_SIZE;
    const sliced = (rows ?? []).slice(0, PAGE_SIZE).reverse();

    // Busca perfis dos remetentes em batch
    const senderIds = [...new Set(sliced.map((m: any) => m.sender_id))] as string[];
    const { data: profiles } = senderIds.length
      ? await (supabase as any)
          .from('user_profiles')
          .select('id, full_name, avatar_url, role')
          .in('id', senderIds)
      : { data: [] };

    const profileMap: Record<string, any> = {};
    for (const p of profiles ?? []) profileMap[p.id] = p;

    const messages = sliced.map((m: any) => ({
      id: m.id,
      room_id: m.room_id,
      sender_id: m.sender_id,
      content: m.content,
      message_type: m.message_type,
      created_at: m.created_at,
      sender: profileMap[m.sender_id] ?? null,
    }));

    // Atualiza last_read_at do membro
    await (supabase as any)
      .from('team_room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    return NextResponse.json({ messages, has_more });
  } catch (err: any) {
    console.error('[team/messages GET] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/team/rooms/[id]/messages
 * Envia mensagem na sala
 * Body: { content: string, message_type?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    const body = await request.json();
    const { content, message_type = 'text' } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: 'content too long (max 10000)' }, { status: 400 });
    }

    // RLS garante que só membros podem inserir — dupla verificação explícita
    const { data: membership } = await (supabase as any)
      .from('team_room_members')
      .select('room_id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: message, error } = await (supabase as any)
      .from('team_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: content.trim(),
        message_type,
      })
      .select('id, room_id, sender_id, content, message_type, created_at')
      .single();

    if (error) {
      console.error('[team/messages POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Busca perfil do remetente
    const { data: senderProfile } = await (supabase as any)
      .from('user_profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', user.id)
      .single();

    // Atualiza updated_at da sala (para ordenação na lista)
    await (supabase as any)
      .from('team_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);

    return NextResponse.json({
      message: {
        id: message.id,
        room_id: message.room_id,
        sender_id: message.sender_id,
        content: message.content,
        message_type: message.message_type,
        created_at: message.created_at,
        sender: senderProfile ?? null,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('[team/messages POST] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
