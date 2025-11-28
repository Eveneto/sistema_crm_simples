'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

export function DashboardTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, today: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);

        // Buscar tarefas pendentes
        const response = await fetch('/api/tasks?status=pending&limit=5');
        if (!response.ok) throw new Error('Erro ao carregar tarefas');

        const data = await response.json();
        setTasks(data.tasks);

        // Calcular estatísticas
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const overdue = data.tasks.filter(
          (t: Task) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
        ).length;

        const dueToday = data.tasks.filter((t: Task) => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= today && dueDate < tomorrow;
        }).length;

        setStats({ total: data.total, overdue, today: dueToday });

        logger.info('Dashboard tasks loaded', { count: data.tasks.length });
      } catch (err) {
        logger.error('Erro ao carregar tasks do dashboard:', { err });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <CardTitle>Tarefas Pendentes</CardTitle>
        </div>
        <Link href="/dashboard/tasks">
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{stats.total}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-600">{stats.overdue}</span>
            <span className="text-sm text-muted-foreground">Atrasadas</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-orange-600">{stats.today}</span>
            <span className="text-sm text-muted-foreground">Hoje</span>
          </div>
        </div>

        {/* Lista de tarefas */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente</p>
            <Link href="/dashboard/tasks/new">
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.status !== 'completed';

              return (
                <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                  <div
                    className={cn(
                      'p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer',
                      isOverdue && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        {task.due_date && (
                          <div className="flex items-center gap-1 mt-1">
                            {isOverdue ? (
                              <AlertCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span
                              className={cn(
                                'text-xs',
                                isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                              )}
                            >
                              {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'destructive'
                            : task.priority === 'high'
                              ? 'default'
                              : 'secondary'
                        }
                        className="shrink-0"
                      >
                        {task.priority === 'urgent' && 'Urgente'}
                        {task.priority === 'high' && 'Alta'}
                        {task.priority === 'medium' && 'Média'}
                        {task.priority === 'low' && 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}

            <Link href="/dashboard/tasks/new">
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
