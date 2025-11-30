/**
 * Pipeline Page
 * Página principal do Kanban de vendas
 */

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PipelineBoard } from '@/components/deals/pipeline-board';
import { PipelineSkeleton } from '@/components/deals/pipeline-skeleton';
import { DealForm } from '@/components/deals/deal-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import type { PipelineStage, DealWithRelations } from '@/types/deal';

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPipelineData();
  }, []);

  async function fetchPipelineData() {
    try {
      const supabase = createClient();

      // Verificar autenticação
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Buscar stages
      const { data: stages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position', { ascending: true });

      if (stagesError) {
        console.error('Error fetching stages:', stagesError);
        return;
      }

      // Buscar deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(id, name, email),
          stage:deal_stages(id, name, color)
        `)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
        return;
      }

      // Agrupar deals por stage
      const pipelineData: PipelineStage[] = (stages as any[]).map((stage: any) => {
        const stageDeals = (deals as any[]).filter((deal: any) => deal.stage_id === stage.id);
        const totalValue = stageDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);

        return {
          ...stage,
          deals: stageDeals,
          count: stageDeals.length,
          totalValue,
        };
      });

      setStages(pipelineData);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (deal: DealWithRelations) => {
    router.push(`/dashboard/deals/${deal.id}`);
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    fetchPipelineData(); // Recarregar dados
  };

  const handleCancel = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie seus negócios
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Negócio
        </Button>
      </div>

      {/* Pipeline Board */}
      {loading ? (
        <PipelineSkeleton />
      ) : (
        <PipelineBoard stages={stages} onEdit={handleEdit} />
      )}

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
  );
}
