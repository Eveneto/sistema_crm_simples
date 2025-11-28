import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { updateTaskSchema } from '@/types/task';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Nota: Desabilitando verificação de tipos para Supabase até migrations serem aplicadas
// A tabela 'tasks' ainda não existe no schema cache do Supabase

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id]
 * Busca uma tarefa específica
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar task (RLS garante que usuário só vê suas próprias tasks)
    const { data: task, error } = await supabase
      .from('tasks')
      .select(
        '*, deals(id, title, value, stage), contacts(id, name, email, phone), assigned_user:auth.users!assigned_to(id, email)'
      )
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Erro ao buscar task:', { error, task_id: id, user_id: user.id });
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    logger.info('Task encontrada', { task_id: id, user_id: user.id });

    return NextResponse.json({ task });
  } catch (error) {
    logger.error('Erro inesperado ao buscar task:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/[id]
 * Atualiza uma tarefa
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse e validar body
    const body = await request.json();
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Atualizar task (RLS garante que usuário só atualiza suas próprias tasks)
    const { data: task, error } = (await supabase
      .from('tasks')
      .update(updateData as any)
      .eq('id', id)
      .select('*, deals(title), contacts(name), assigned_user:auth.users!assigned_to(id, email)')
      .single()) as any;

    if (error) {
      logger.error('Erro ao atualizar task:', { error, task_id: id, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 });
    }

    logger.info('Task atualizada com sucesso', {
      user_id: user.id,
      task_id: id,
      updates: Object.keys(updateData),
    });

    // Se status mudou para completed, criar notificação para o criador
    if (updateData.status === 'completed' && task.assigned_to !== task.user_id) {
      try {
        await (supabase.rpc as any)('create_notification', {
          p_user_id: task.user_id,
          p_title: 'Tarefa Concluída',
          p_message: `A tarefa "${task.title}" foi concluída`,
          p_type: 'task_assigned',
          p_entity_type: 'task',
          p_entity_id: task.id,
          p_link: `/dashboard/tasks/${task.id}`,
        });
        logger.info('Notificação de conclusão criada', { task_id: task.id });
      } catch (notifError) {
        logger.error('Erro ao criar notificação de conclusão:', { notifError });
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    logger.error('Erro inesperado ao atualizar task:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deleta uma tarefa
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Deletar task (RLS garante que usuário só deleta suas próprias tasks)
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      logger.error('Erro ao deletar task:', { error, task_id: id, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao deletar tarefa' }, { status: 500 });
    }

    logger.info('Task deletada com sucesso', { task_id: id, user_id: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro inesperado ao deletar task:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
