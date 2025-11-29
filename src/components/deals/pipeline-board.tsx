/**
 * Pipeline Board Component
 * Container principal do Kanban
 * 
 * Clean Code:
 * - Organiza colunas horizontalmente
 * - Gerencia scroll horizontal
 * - Prepara estrutura para drag-and-drop (será adicionado na US-041)
 */

'use client';

import { PipelineColumn } from './pipeline-column';
import type { PipelineStage } from '@/types/deal';

interface PipelineBoardProps {
  stages: PipelineStage[];
}

export function PipelineBoard({ stages }: PipelineBoardProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 p-6 min-w-max">
        {stages.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={stage.deals}
          />
        ))}
        
        {stages.length === 0 && (
          <div className="flex items-center justify-center w-full h-64">
            <p className="text-muted-foreground">
              Nenhum estágio configurado. Configure os estágios para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
