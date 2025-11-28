// ============================================
// Component: AutomationCard
// Sprint 3 - US-026
// ============================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, Edit, Trash2, Clock, Zap, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AutomationRule } from '@/types/automation';
import { TRIGGER_TYPE_LABELS, ACTION_TYPE_LABELS } from '@/types/automation';
import { useRouter } from 'next/navigation';

interface AutomationCardProps {
  automation: AutomationRule;
  onToggle?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function AutomationCard({ automation, onToggle, onDelete }: AutomationCardProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    if (!onToggle) return;

    setIsToggling(true);
    try {
      await onToggle(automation.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm(`Tem certeza que deseja deletar a automação "${automation.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(automation.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/automations/${automation.id}`);
  };

  return (
    <Card className={`transition-all ${automation.is_active ? '' : 'opacity-60'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{automation.name}</CardTitle>
              {automation.is_active ? (
                <Badge variant="default" className="bg-green-500">
                  <Power className="w-3 h-3 mr-1" />
                  Ativa
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <PowerOff className="w-3 h-3 mr-1" />
                  Inativa
                </Badge>
              )}
            </div>
            {automation.description && <CardDescription>{automation.description}</CardDescription>}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
                {automation.is_active ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Gatilho */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Gatilho</span>
            </div>
            <Badge variant="outline">{TRIGGER_TYPE_LABELS[automation.trigger_type]}</Badge>

            {/* Condições do gatilho */}
            <div className="mt-2 text-sm text-muted-foreground">
              {automation.trigger_type === 'time_based' &&
                automation.trigger_conditions.days_inactive && (
                  <span>Após {automation.trigger_conditions.days_inactive} dias sem atividade</span>
                )}
              {automation.trigger_type === 'value_threshold' && (
                <span>
                  {automation.trigger_conditions.min_value &&
                    `Valor mínimo: R$ ${automation.trigger_conditions.min_value}`}
                  {automation.trigger_conditions.max_value &&
                    ` | Valor máximo: R$ ${automation.trigger_conditions.max_value}`}
                </span>
              )}
            </div>
          </div>

          {/* Ações */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Ações ({automation.actions.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {automation.actions.map((action, index) => (
                <Badge key={index} variant="secondary">
                  {ACTION_TYPE_LABELS[action.type]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Última execução */}
          {automation.last_executed_at && (
            <div className="pt-3 border-t text-xs text-muted-foreground">
              Última execução: {new Date(automation.last_executed_at).toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
