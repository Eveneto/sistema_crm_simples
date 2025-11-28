import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

/**
 * GET /api/export/tasks
 * Exporta todas as tarefas do usuário em formato JSON
 * O cliente converte para CSV usando papaparse
 */
export async function GET(_request: NextRequest) {
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

    // Buscar todas as tarefas do usuário com relações
    const { data: tasks, error } = (await supabase
      .from('tasks')
      .select('*, deals(title), contacts(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as any;

    if (error) {
      logger.error('Erro ao exportar tarefas:', { error, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao exportar tarefas' }, { status: 500 });
    }

    // Formatar dados para exportação
    const exportData =
      tasks?.map((task: any) => ({
        ID: task.id,
        Título: task.title,
        Descrição: task.description || '',
        Status: statusLabels[task.status] || task.status,
        Prioridade: priorityLabels[task.priority] || task.priority,
        'Data de Vencimento': task.due_date ? new Date(task.due_date).toLocaleString('pt-BR') : '',
        Lembrete: task.reminder_at ? new Date(task.reminder_at).toLocaleString('pt-BR') : '',
        'Negócio Relacionado': task.deals?.title || '',
        'Contato Relacionado': task.contacts?.name || '',
        'Data de Criação': new Date(task.created_at).toLocaleString('pt-BR'),
        'Última Atualização': new Date(task.updated_at).toLocaleString('pt-BR'),
      })) || [];

    logger.info('Tarefas exportadas com sucesso', {
      user_id: user.id,
      count: exportData.length,
    });

    return NextResponse.json({
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro inesperado ao exportar tarefas:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
