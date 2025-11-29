/**
 * Pipeline Column Component
 * Coluna de estágio no Kanban
 * 
 * Clean Code:
 * - Exibe deals de um estágio
 * - Estatísticas (count + total)
 * - Droppable (drag-and-drop)
 */

'use client';

import { formatCurrency } from '@/lib/format';
import { DealCard } from './deal-card';
import type { DealWithRelations } from '@/types/deal';

interface PipelineColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  deals: DealWithRelations[];
}

export function PipelineColumn({ stage, deals }: PipelineColumnProps) {
  // Calcular estatísticas
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const count = deals.length;

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Header da coluna */}
      <div className="p-4 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Indicador de cor */}
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-sm">{stage.name}</h3>
          </div>
          
          {/* Contador */}
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
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
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] bg-muted/20 rounded-b-lg">
        {deals.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Nenhum negócio neste estágio
          </p>
        ) : (
          deals.map(deal => (
            <DealCard 
              key={deal.id} 
              deal={deal}
            />
          ))
        )}
      </div>
    </div>
  );
}
