'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    status?: Task['status'];
    priority?: Task['priority'];
    overdue?: boolean;
    due_today?: boolean;
    search?: string;
  }) => void;
}

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined as Task['status'] | undefined,
    priority: undefined as Task['priority'] | undefined,
    overdue: false,
    due_today: false,
    search: '',
  });

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: undefined,
      priority: undefined,
      overdue: false,
      due_today: false,
      search: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.overdue || filters.due_today || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {
                [
                  filters.status,
                  filters.priority,
                  filters.overdue,
                  filters.due_today,
                  filters.search,
                ].filter(Boolean).length
              }
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('priority', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vencimento</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.overdue ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('overdue', !filters.overdue)}
                    className="flex-1"
                  >
                    Atrasadas
                  </Button>
                  <Button
                    variant={filters.due_today ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('due_today', !filters.due_today)}
                    className="flex-1"
                  >
                    Hoje
                  </Button>
                </div>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={handleClearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
