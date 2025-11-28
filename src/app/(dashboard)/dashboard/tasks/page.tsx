'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilters } from '@/components/tasks/task-filters';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/export/export-button';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    status?: Task['status'];
    priority?: Task['priority'];
    overdue?: boolean;
    due_today?: boolean;
    search?: string;
  }>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskUpdate = () => {
    // Força atualização da lista
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas tarefas e lembretes</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            endpoint="/api/export/tasks"
            filename="tarefas"
            label="Exportar"
            variant="outline"
          />
          <Button onClick={() => router.push('/dashboard/tasks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <TaskFilters onFilterChange={setFilters} />

      <TaskList key={refreshKey} filters={filters} onTaskUpdate={handleTaskUpdate} />
    </div>
  );
}
