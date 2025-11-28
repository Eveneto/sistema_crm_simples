// ============================================
// API: PATCH/POST /api/notifications/mark-read
// Sprint 3 - US-027
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { markAsReadSchema } from '@/types/notification';

type SupabaseUpdateResult = {
  error: unknown;
  count?: number;
};

// PATCH - Marcar notificações específicas como lidas
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Validar payload
    const validation = markAsReadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { notification_ids } = validation.data;

    // Dados para atualização
    const updateData = {
      read: true,
      read_at: new Date().toISOString(),
    };

    // Marcar como lidas (apenas notificações do usuário)
    // Supabase ainda não conhece a tabela notifications (será criada na migration)
    const { error, count } = (await supabase
      .from('notifications')
      .update(updateData)
      .in('id', notification_ids)
      .eq('user_id', user.id)) as SupabaseUpdateResult;

    if (error) {
      logger.error('Failed to mark notifications as read', {
        error,
        userId: user.id,
        notificationIds: notification_ids,
      });
      return NextResponse.json(
        { error: 'Erro ao marcar notificações como lidas' },
        { status: 500 }
      );
    }

    logger.info('Notifications marked as read', {
      userId: user.id,
      count,
    });

    return NextResponse.json({
      success: true,
      updated_count: count || 0,
    });
  } catch (error) {
    logger.error('Unexpected error in PATCH /api/notifications/mark-read', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Marcar todas as notificações como lidas
export async function POST(_request: NextRequest) {
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

    // Dados para atualização
    const updateData = {
      read: true,
      read_at: new Date().toISOString(),
    };

    // Marcar TODAS as notificações não lidas do usuário como lidas
    // Supabase ainda não conhece a tabela notifications (será criada na migration)
    const { error, count } = (await supabase
      .from('notifications')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('read', false)) as SupabaseUpdateResult;

    if (error) {
      logger.error('Failed to mark all notifications as read', {
        error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Erro ao marcar todas notificações como lidas' },
        { status: 500 }
      );
    }

    logger.info('All notifications marked as read', {
      userId: user.id,
      count,
    });

    return NextResponse.json({
      success: true,
      updated_count: count || 0,
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/notifications/mark-read', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
