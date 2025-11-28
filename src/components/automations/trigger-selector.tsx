// ============================================
// Component: TriggerSelector
// Sprint 3 - US-026
// ============================================

'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TriggerType, TriggerConditions } from '@/types/automation';
import { TRIGGER_TYPE_LABELS } from '@/types/automation';

interface TriggerSelectorProps {
  triggerType: TriggerType;
  conditions: TriggerConditions;
  onTriggerTypeChange: (type: TriggerType) => void;
  onConditionsChange: (conditions: TriggerConditions) => void;
}

export function TriggerSelector({
  triggerType,
  conditions,
  onTriggerTypeChange,
  onConditionsChange,
}: TriggerSelectorProps) {
  const handleConditionChange = (key: keyof TriggerConditions, value: string | number) => {
    onConditionsChange({
      ...conditions,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Tipo de Gatilho */}
      <div className="space-y-2">
        <Label>Tipo de Gatilho</Label>
        <Select
          value={triggerType}
          onValueChange={(value) => {
            onTriggerTypeChange(value as TriggerType);
            onConditionsChange({});
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRIGGER_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condições baseadas no tipo */}
      {triggerType === 'time_based' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="days_inactive">Dias sem atividade</Label>
            <Input
              id="days_inactive"
              type="number"
              min="1"
              max="365"
              value={conditions.days_inactive || ''}
              onChange={(e) =>
                handleConditionChange('days_inactive', parseInt(e.target.value) || 0)
              }
              placeholder="Ex: 7"
            />
            <p className="text-xs text-muted-foreground">
              A automação será executada após este período sem atividade
            </p>
          </div>
        </div>
      )}

      {triggerType === 'status_change' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="from_status">Status anterior</Label>
            <Input
              id="from_status"
              value={conditions.from_status || ''}
              onChange={(e) => handleConditionChange('from_status', e.target.value)}
              placeholder="Ex: lead"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to_status">Novo status</Label>
            <Input
              id="to_status"
              value={conditions.to_status || ''}
              onChange={(e) => handleConditionChange('to_status', e.target.value)}
              placeholder="Ex: cliente"
            />
          </div>
        </div>
      )}

      {triggerType === 'tag_added' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={conditions.tag || ''}
              onChange={(e) => handleConditionChange('tag', e.target.value)}
              placeholder="Ex: vip"
            />
            <p className="text-xs text-muted-foreground">
              A automação será executada quando esta tag for adicionada
            </p>
          </div>
        </div>
      )}

      {triggerType === 'value_threshold' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="min_value">Valor mínimo (R$)</Label>
            <Input
              id="min_value"
              type="number"
              min="0"
              step="0.01"
              value={conditions.min_value || ''}
              onChange={(e) => handleConditionChange('min_value', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 50000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_value">Valor máximo (R$)</Label>
            <Input
              id="max_value"
              type="number"
              min="0"
              step="0.01"
              value={conditions.max_value || ''}
              onChange={(e) => handleConditionChange('max_value', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 100000"
            />
          </div>
        </div>
      )}

      {triggerType === 'stage_entered' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="stage">Estágio</Label>
            <Select
              value={conditions.stage || ''}
              onValueChange={(value) => handleConditionChange('stage', value)}
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
            <p className="text-xs text-muted-foreground">
              A automação será executada quando o negócio entrar neste estágio
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
