'use client';

import { Task, getPriorityColor, getStatusColor, formatDueDate, isOverdue } from '@/types/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Circle, Clock, User, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);
  const overdueFlag = isOverdue(task);

  const handleToggleComplete = () => {
    if (onStatusChange) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow',
        overdueFlag && 'border-red-500 border-l-4'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mt-1"
              onClick={handleToggleComplete}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            <div className="flex-1">
              <CardTitle
                className={cn(
                  'text-lg',
                  task.status === 'completed' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColor}>
              {task.status === 'pending' && 'Pendente'}
              {task.status === 'in_progress' && 'Em Andamento'}
              {task.status === 'completed' && 'Concluída'}
              {task.status === 'cancelled' && 'Cancelada'}
            </Badge>
            <Badge variant="outline" className={priorityColor}>
              {task.priority === 'low' && 'Baixa'}
              {task.priority === 'medium' && 'Média'}
              {task.priority === 'high' && 'Alta'}
              {task.priority === 'urgent' && 'Urgente'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {task.due_date && (
            <div
              className={cn('flex items-center gap-1', overdueFlag && 'text-red-600 font-semibold')}
            >
              <Calendar className="h-4 w-4" />
              <span>{formatDueDate(task.due_date)}</span>
              {overdueFlag && <Clock className="h-4 w-4 ml-1" />}
            </div>
          )}
          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Atribuído</span>
            </div>
          )}
          {task.deal_id && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <span>Deal vinculado</span>
            </div>
          )}
          {task.contact_id && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <span>Contato vinculado</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Link href={`/dashboard/tasks/${task.id}`}>
            <Button variant="outline" size="sm">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
