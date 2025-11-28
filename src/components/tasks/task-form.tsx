'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskPayload, type Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface TaskFormProps {
  task?: Task;
  dealId?: string;
  contactId?: string;
  onSuccess?: (task: Task) => void;
  onCancel?: () => void;
}

export function TaskForm({ task, dealId, contactId, onSuccess, onCancel }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTaskPayload>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          deal_id: task.deal_id || dealId,
          contact_id: task.contact_id || contactId,
          due_date: task.due_date ? task.due_date.slice(0, 16) : '',
          reminder_at: task.reminder_at ? task.reminder_at.slice(0, 16) : '',
        }
      : {
          status: 'pending',
          priority: 'medium',
          deal_id: dealId,
          contact_id: contactId,
        },
  });

  const onSubmit = async (data: CreateTaskPayload) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Limpar campos vazios e converter para null se necessário
      const payload = {
        ...data,
        due_date: data.due_date || null,
        reminder_at: data.reminder_at || null,
      };

      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar tarefa');
      }

      const result = await response.json();
      logger.info('Task salva com sucesso', { task_id: result.task.id });

      if (onSuccess) {
        onSuccess(result.task);
      } else {
        router.push('/dashboard/tasks');
      }
    } catch (err) {
      logger.error('Erro ao salvar task:', { err });
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input id="title" {...register('title')} placeholder="Ex: Enviar proposta comercial" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descreva os detalhes da tarefa..."
          rows={4}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as Task['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={watch('priority')}
            onValueChange={(value) => setValue('priority', value as Task['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Input id="due_date" type="datetime-local" {...register('due_date')} />
          {errors.due_date && <p className="text-sm text-red-500">{errors.due_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_at">Lembrete</Label>
          <Input id="reminder_at" type="datetime-local" {...register('reminder_at')} />
          {errors.reminder_at && (
            <p className="text-sm text-red-500">{errors.reminder_at.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {task ? 'Atualizar' : 'Criar'} Tarefa
        </Button>
      </div>
    </form>
  );
}
