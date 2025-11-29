/**
 * Pipeline Page
 * Página principal do Kanban de vendas
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { PipelineBoard } from '@/components/deals/pipeline-board';
import { PipelineSkeleton } from '@/components/deals/pipeline-skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { PipelineStage } from '@/types/deal';

export const metadata = {
  title: 'Pipeline de Vendas | CRM',
  description: 'Visualize e gerencie seus negócios em um pipeline visual',
};

async function getPipelineData(): Promise<PipelineStage[]> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar stages
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true });

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
    return [];
  }

  // Buscar deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select(`
      *,
      contact:contacts(id, name, email),
      stage:stages(id, name, color, "order")
    `)
    .eq('user_id', user.id)
    .order('position', { ascending: true })
    .limit(100);

  if (dealsError) {
    console.error('Error fetching deals:', dealsError);
    return [];
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

  return pipelineData;
}

export default async function PipelinePage() {
  const stages = await getPipelineData();

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

        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Negócio
        </Button>
      </div>

      {/* Pipeline Board */}
      <Suspense fallback={<PipelineSkeleton />}>
        <PipelineBoard stages={stages} />
      </Suspense>
    </div>
  );
}
