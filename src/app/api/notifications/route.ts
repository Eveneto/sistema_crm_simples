// ============================================
// API: GET/POST /api/notifications
// Sprint 3 - US-027
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { createNotificationSchema } from '@/types/notification';
import type { Notification, NotificationsResponse } from '@/types/notification';

// GET - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const read = searchParams.get('read');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Query base
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (read !== null) {
      query = query.eq('read', read === 'true');
    }
    if (type) {
      query = query.eq('type', type);
    }

    // Paginação
    query = query.range(offset, offset + limit - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch notifications', { error, userId: user.id });
      return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
    }

    // Contar notificações não lidas
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    const response: NotificationsResponse = {
      notifications: notifications as Notification[],
      total: count || 0,
      unread_count: unreadCount || 0,
      has_more: (count || 0) > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Unexpected error in GET /api/notifications', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova notificação (uso interno/automações)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação (admin/sistema)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar payload
    const validation = createNotificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Inserir notificação
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification', { error, data });
      return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
    }

    logger.info('Notification created', {
      notificationId: notification.id,
      userId: data.user_id,
      type: data.type,
    });

    return NextResponse.json({ notification, success: true }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected error in POST /api/notifications', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
