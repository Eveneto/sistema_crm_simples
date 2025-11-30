/**
 * Pipeline Column Component
 * Coluna de estágio no Kanban com Drag and Drop
 * 
 * Clean Code:
 * - Exibe deals de um estágio
 * - Estatísticas (count + total)
 * - Droppable para drag-and-drop
 */

'use client';

import { Droppable } from '@hello-pangea/dnd';
import { formatCurrency } from '@/lib/format';
import { DealCard } from './deal-card';
import { Package } from 'lucide-react';
import type { DealWithRelations } from '@/types/deal';

interface PipelineColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  deals: DealWithRelations[];
  onEdit?: (deal: DealWithRelations) => void;
  onView?: (deal: DealWithRelations) => void;
}

export function PipelineColumn({ stage, deals, onEdit, onView }: PipelineColumnProps) {
  // Calcular estatísticas
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const count = deals.length;

  return (
    <div 
      className="flex flex-col w-full sm:w-80 flex-shrink-0"
      role="region"
      aria-label={`${stage.name} - ${count} negócios`}
    >
      {/* Header da coluna */}
      <div className="p-4 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Indicador de cor */}
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
              aria-hidden="true"
            />
            <h3 className="font-semibold text-sm truncate">{stage.name}</h3>
          </div>
          
          {/* Contador */}
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full flex-shrink-0">
            {count}
          </span>
        </div>

        {/* Valor total */}
        {totalValue > 0 && (
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      {/* Lista de deals */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] bg-muted/20 rounded-b-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
            }`}
          >
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Nenhum negócio aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  Arraste um card ou crie novo
                </p>
              </div>
            ) : (
              deals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  index={index}
                  onEdit={onEdit}
                  onView={onView}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
