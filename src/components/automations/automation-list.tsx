// ============================================
// Component: AutomationList
// Sprint 3 - US-026
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { AutomationCard } from './automation-card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AutomationRule } from '@/types/automation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';

export function AutomationList() {
  const router = useRouter();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchAutomations = async () => {
    setIsLoading(true);
    try {
      let url = '/api/automations?limit=100';

      if (filter === 'active') {
        url += '&is_active=true';
      } else if (filter === 'inactive') {
        url += '&is_active=false';
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar automações');
      }

      const data = await response.json();
      setAutomations(data.automations || []);
    } catch (error) {
      logger.error('Failed to fetch automations', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status da automação');
      }

      // Atualizar lista
      await fetchAutomations();
    } catch (error) {
      logger.error('Failed to toggle automation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        automationId: id,
      });
      alert('Erro ao alterar status da automação');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar automação');
      }

      // Atualizar lista
      await fetchAutomations();
    } catch (error) {
      logger.error('Failed to delete automation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        automationId: id,
      });
      alert('Erro ao deletar automação');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Automações</h2>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => router.push('/dashboard/automations/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Lista de automações */}
      {automations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {filter === 'all'
              ? 'Nenhuma automação criada ainda'
              : `Nenhuma automação ${filter === 'active' ? 'ativa' : 'inativa'}`}
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard/automations/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Automação
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
