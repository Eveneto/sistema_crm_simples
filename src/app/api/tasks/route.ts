import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { createTaskSchema, type TaskFilters } from '@/types/task';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Nota: Desabilitando verificação de tipos para Supabase até migrations serem aplicadas
// A tabela 'tasks' ainda não existe no schema cache do Supabase

/**
 * GET /api/tasks
 * Lista tarefas com filtros opcionais
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: TaskFilters = {
      status: (searchParams.get('status') as any) || undefined,
      priority: (searchParams.get('priority') as any) || undefined,
      deal_id: searchParams.get('deal_id') || undefined,
      contact_id: searchParams.get('contact_id') || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      overdue: searchParams.get('overdue') === 'true',
      due_today: searchParams.get('due_today') === 'true',
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Build query
    let query = supabase
      .from('tasks')
      .select('*, deals(title), contacts(name)', {
        count: 'exact',
      })
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }
    if (filters.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.overdue) {
      query = query
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed')
        .neq('status', 'cancelled');
    }
    if (filters.due_today) {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('due_date', startOfDay).lte('due_date', endOfDay);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Pagination and sorting
    query = query
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      logger.error('Erro ao buscar tasks:', { error, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 });
    }

    logger.info('Tasks listadas com sucesso', {
      user_id: user.id,
      count: tasks?.length || 0,
      filters,
    });

    return NextResponse.json({
      tasks: tasks || [],
      total: count || 0,
    });
  } catch (error) {
    logger.error('Erro inesperado ao listar tasks:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Cria uma nova tarefa
 */
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const taskData = validationResult.data;

    // Adicionar user_id do usuário autenticado
    const taskPayload = {
      ...taskData,
      user_id: user.id,
    };

    // Inserir task
    const { data: task, error } = (await supabase
      .from('tasks')
      .insert([taskPayload as any])
      .select('*, deals(title), contacts(name)')
      .single()) as any;

    if (error) {
      logger.error('Erro ao criar task:', { error, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 });
    }

    logger.info('Task criada com sucesso', {
      user_id: user.id,
      task_id: task.id,
      title: task.title,
    });

    // Se tem assigned_to e é diferente do user_id, criar notificação
    if (task.assigned_to && task.assigned_to !== user.id) {
      try {
        await (supabase.rpc as any)('create_notification', {
          p_user_id: task.assigned_to,
          p_title: 'Nova Tarefa Atribuída',
          p_message: `Você foi atribuído à tarefa: ${task.title}`,
          p_type: 'task_assigned',
          p_entity_type: 'task',
          p_entity_id: task.id,
          p_link: `/dashboard/tasks/${task.id}`,
        });
        logger.info('Notificação de task criada', { task_id: task.id });
      } catch (notifError) {
        // Não falhar a criação da task se notificação falhar
        logger.error('Erro ao criar notificação de task:', { notifError });
      }
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    logger.error('Erro inesperado ao criar task:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
