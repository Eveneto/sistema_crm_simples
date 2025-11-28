// ============================================
// Component: ActionSelector
// Sprint 3 - US-026
// ============================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { ActionType, AutomationAction } from '@/types/automation';
import { ACTION_TYPE_LABELS } from '@/types/automation';

interface ActionSelectorProps {
  onAddAction: (action: AutomationAction) => void;
}

export function ActionSelector({ onAddAction }: ActionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('move_stage');
  const [actionData, setActionData] = useState<Partial<AutomationAction>>({});

  const handleAdd = () => {
    // Validar campos obrigatórios
    if (actionType === 'move_stage' && !actionData.target_stage) {
      alert('Informe o estágio de destino');
      return;
    }
    if (actionType === 'add_tag' && !actionData.tag) {
      alert('Informe a tag');
      return;
    }
    if (actionType === 'send_notification' && !actionData.notification_message) {
      alert('Informe a mensagem da notificação');
      return;
    }
    if (actionType === 'create_task' && !actionData.task_title) {
      alert('Informe o título da tarefa');
      return;
    }

    onAddAction({
      type: actionType,
      ...actionData,
    } as AutomationAction);

    // Resetar e fechar
    setActionData({});
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Ação</DialogTitle>
          <DialogDescription>Escolha o tipo de ação e configure seus parâmetros</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de Ação */}
          <div className="space-y-2">
            <Label>Tipo de Ação</Label>
            <Select
              value={actionType}
              onValueChange={(value: string) => {
                setActionType(value as ActionType);
                setActionData({});
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos específicos por tipo */}
          {actionType === 'move_stage' && (
            <div className="space-y-2">
              <Label htmlFor="target_stage">Estágio de Destino *</Label>
              <Select
                value={actionData.target_stage || ''}
                onValueChange={(value: string) =>
                  setActionData({ ...actionData, target_stage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estágio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualificacao">Qualificação</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="fechamento">Fechamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {actionType === 'add_tag' && (
            <div className="space-y-2">
              <Label htmlFor="tag">Tag *</Label>
              <Input
                id="tag"
                value={actionData.tag || ''}
                onChange={(e) => setActionData({ ...actionData, tag: e.target.value })}
                placeholder="Ex: follow-up"
              />
            </div>
          )}

          {actionType === 'send_notification' && (
            <div className="space-y-2">
              <Label htmlFor="notification_message">Mensagem *</Label>
              <Textarea
                id="notification_message"
                value={actionData.notification_message || ''}
                onChange={(e) =>
                  setActionData({
                    ...actionData,
                    notification_message: e.target.value,
                  })
                }
                placeholder="Ex: Negócio movido automaticamente"
                rows={3}
              />
            </div>
          )}

          {actionType === 'create_task' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="task_title">Título da Tarefa *</Label>
                <Input
                  id="task_title"
                  value={actionData.task_title || ''}
                  onChange={(e) => setActionData({ ...actionData, task_title: e.target.value })}
                  placeholder="Ex: Follow-up necessário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_description">Descrição</Label>
                <Textarea
                  id="task_description"
                  value={actionData.task_description || ''}
                  onChange={(e) =>
                    setActionData({
                      ...actionData,
                      task_description: e.target.value,
                    })
                  }
                  placeholder="Descreva a tarefa..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_due_days">Prazo (dias)</Label>
                <Input
                  id="task_due_days"
                  type="number"
                  min="1"
                  max="365"
                  value={actionData.task_due_days || ''}
                  onChange={(e) =>
                    setActionData({
                      ...actionData,
                      task_due_days: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="Ex: 1"
                />
              </div>
            </>
          )}

          {actionType === 'change_priority' && (
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
              <Select
                value={actionData.priority || ''}
                onValueChange={(value: string) =>
                  setActionData({
                    ...actionData,
                    priority: value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
