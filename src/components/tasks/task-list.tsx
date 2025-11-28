'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { TaskCard } from './task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Inbox } from 'lucide-react';
import { logger } from '@/lib/logger';

interface TaskListProps {
  filters?: {
    status?: Task['status'];
    priority?: Task['priority'];
    deal_id?: string;
    contact_id?: string;
    overdue?: boolean;
    due_today?: boolean;
    search?: string;
  };
  onTaskUpdate?: () => void;
}

export function TaskList({ filters, onTaskUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construir query params
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.deal_id) params.append('deal_id', filters.deal_id);
      if (filters?.contact_id) params.append('contact_id', filters.contact_id);
      if (filters?.overdue) params.append('overdue', 'true');
      if (filters?.due_today) params.append('due_today', 'true');
      if (filters?.search) params.append('search', filters.search);
      params.append('limit', '50');

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();
      setTasks(data.tasks);
      setTotal(data.total);

      logger.info('Tasks carregadas', { count: data.tasks.length, total: data.total });
    } catch (err) {
      logger.error('Erro ao carregar tasks:', { err });
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.status,
    filters?.priority,
    filters?.deal_id,
    filters?.contact_id,
    filters?.overdue,
    filters?.due_today,
    filters?.search,
  ]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar tarefa');
      }

      // Atualizar lista local
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );

      // Notificar componente pai
      if (onTaskUpdate) {
        onTaskUpdate();
      }

      logger.info('Task atualizada', { taskId, newStatus });
    } catch (err) {
      logger.error('Erro ao atualizar task:', { err });
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
        <p className="text-sm text-muted-foreground">
          {filters ? 'Tente ajustar os filtros de busca' : 'Crie sua primeira tarefa para começar'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
      </p>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
