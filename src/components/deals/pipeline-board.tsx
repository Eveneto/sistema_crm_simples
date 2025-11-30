/**
 * Pipeline Board Component
 * Container principal do Kanban com Drag and Drop
 *
 * Clean Code:
 * - Organiza colunas horizontalmente
 * - Gerencia scroll horizontal
 * - Implementa drag and drop com optimistic updates
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PipelineColumn } from './pipeline-column';
import { AlertCircle } from 'lucide-react';
import type { PipelineStage, DealWithRelations } from '@/types/deal';

interface PipelineBoardProps {
  stages: PipelineStage[];
  onEdit?: (deal: DealWithRelations) => void;
  onView?: (deal: DealWithRelations) => void;
}

export function PipelineBoard({ stages, onEdit, onView }: PipelineBoardProps) {
  // Estado local para optimistic updates
  const [localStages, setLocalStages] = useState<PipelineStage[]>(stages);

  // Atualizar estado local quando stages mudam
  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino ou é a mesma posição, ignorar
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const sourceStageId = source.droppableId;
    const destStageId = destination.droppableId;
    const dealId = draggableId;

    // Optimistic update - mover imediatamente na UI
    setLocalStages(prevStages => {
      const newStages = [...prevStages];
      const sourceStage = newStages.find(s => s.id === sourceStageId);
      const destStage = newStages.find(s => s.id === destStageId);

      if (!sourceStage || !destStage) return prevStages;

      // Encontrar o deal na source stage
      const dealIndex = sourceStage.deals.findIndex(d => d.id === dealId);
      if (dealIndex === -1) return prevStages;

      const [movedDeal] = sourceStage.deals.splice(dealIndex, 1);

      // Atualizar stage_id do deal
      movedDeal.stage_id = destStageId;
      movedDeal.stage = destStage;

      // Inserir na posição correta na dest stage
      destStage.deals.splice(destination.index, 0, movedDeal);

      return newStages;
    });

    try {
      // API call para persistir a mudança
      const supabase = createClient();
      const { error } = await supabase
        .from('deals')
        .update({
          stage_id: destStageId,
          position: destination.index,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;

      toast.success('Negócio movido com sucesso!');
    } catch (error) {
      console.error('Erro ao mover negócio:', error);

      // Rollback - reverter a mudança local
      setLocalStages(stages);
      toast.error('Erro ao mover negócio. Tente novamente.');
    }
  };

  if (localStages.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4"
        role="status"
        aria-live="polite"
      >
        <AlertCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum estágio configurado</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Configure os estágios do pipeline para começar a gerenciar seus negócios.
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className="w-full overflow-x-auto overflow-y-hidden"
        role="region"
        aria-label="Pipeline de vendas"
      >
        {/* Mobile: Vertical Stack | Desktop: Horizontal Scroll */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 sm:min-w-max">
          {localStages.map(stage => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={stage.deals}
              onEdit={onEdit}
              onView={onView}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
