// ============================================
// Component: AutomationForm
// Sprint 3 - US-026
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { TriggerSelector } from './trigger-selector';
import { ActionSelector } from './action-selector';
import type {
  AutomationRule,
  TriggerType,
  TriggerConditions,
  AutomationAction,
} from '@/types/automation';
import { createAutomationRuleSchema } from '@/types/automation';
import { z } from 'zod';

// Estender o schema para incluir is_active no form
const formSchema = createAutomationRuleSchema.extend({
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface AutomationFormProps {
  initialData?: AutomationRule;
  mode: 'create' | 'edit';
}

export function AutomationForm({ initialData, mode }: AutomationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggerType, setTriggerType] = useState<TriggerType>(
    initialData?.trigger_type || 'time_based'
  );
  const [triggerConditions, setTriggerConditions] = useState<TriggerConditions>(
    initialData?.trigger_conditions || {}
  );
  const [actions, setActions] = useState<AutomationAction[]>(initialData?.actions || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      is_active: initialData?.is_active ?? true,
      trigger_type: initialData?.trigger_type || 'time_based',
      trigger_conditions: initialData?.trigger_conditions || {},
      actions: initialData?.actions || [],
    },
  });

  const isActive = watch('is_active');

  // Atualizar form quando trigger/actions mudam
  useEffect(() => {
    setValue('trigger_type', triggerType);
    setValue('trigger_conditions', triggerConditions);
    setValue('actions', actions);
  }, [triggerType, triggerConditions, actions, setValue]);

  const onSubmit = async (data: FormData) => {
    if (actions.length === 0) {
      alert('Adicione pelo menos uma ação');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = mode === 'create' ? '/api/automations' : `/api/automations/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar automação');
      }

      router.push('/dashboard/automations');
      router.refresh();
    } catch (error) {
      logger.error('Failed to save automation', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(error instanceof Error ? error.message : 'Erro ao salvar automação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAction = (action: AutomationAction) => {
    setActions([...actions, action]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Defina o nome e descrição da automação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Mover negócio após 7 dias"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o que esta automação faz..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Automação ativa' : 'Automação inativa'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gatilho */}
      <Card>
        <CardHeader>
          <CardTitle>Quando executar (Gatilho)</CardTitle>
          <CardDescription>Defina quando esta automação deve ser acionada</CardDescription>
        </CardHeader>
        <CardContent>
          <TriggerSelector
            triggerType={triggerType}
            conditions={triggerConditions}
            onTriggerTypeChange={setTriggerType}
            onConditionsChange={setTriggerConditions}
          />
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>O que fazer (Ações)</CardTitle>
          <CardDescription>Adicione uma ou mais ações a serem executadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {action.type === 'move_stage' && `Mover para: ${action.target_stage}`}
                      {action.type === 'add_tag' && `Adicionar tag: ${action.tag}`}
                      {action.type === 'send_notification' &&
                        `Notificação: ${action.notification_message}`}
                      {action.type === 'create_task' && `Criar tarefa: ${action.task_title}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{action.type.replace('_', ' ')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAction(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <ActionSelector onAddAction={handleAddAction} />

          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma ação adicionada. Clique em &quot;Adicionar Ação&quot; acima.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Criar Automação' : 'Salvar Alterações'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
