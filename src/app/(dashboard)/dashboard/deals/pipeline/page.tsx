/**
 * Pipeline Page
 * Página principal do Kanban de vendas
 */

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PipelineBoard } from '@/components/deals/pipeline-board';
import { PipelineSkeleton } from '@/components/deals/pipeline-skeleton';
import { DealForm } from '@/components/deals/deal-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import type { DealWithRelations } from '@/types/deal';
import { useDeals } from '@/hooks/use-deals-query';
import { useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/animations/page-transition';
import { ErrorBoundary } from '@/components/error-boundary';

export default function PipelinePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query hook com cache automático
  const { data: pipelineData, isLoading } = useDeals();

  // Extrair stages do response
  const stages = pipelineData?.stages || [];

  const handleEdit = (deal: DealWithRelations) => {
    router.push(`/dashboard/deals/${deal.id}`);
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    // React Query invalida automaticamente o cache quando novo deal é criado
    queryClient.invalidateQueries({ queryKey: ['deals'] });
  };

  const handleCancel = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <PageTransition>
      <ErrorBoundary sectionName="Pipeline de Vendas">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
              <p className="text-sm text-muted-foreground">Visualize e gerencie seus negócios</p>
            </div>

            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Negócio
            </Button>
          </div>

          {/* Pipeline Board */}
          {isLoading ? <PipelineSkeleton /> : <PipelineBoard stages={stages} onEdit={handleEdit} />}

          {/* Modal Criar Negócio */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Negócio</DialogTitle>
              </DialogHeader>
              <DealForm
                mode="create"
                stages={stages}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
