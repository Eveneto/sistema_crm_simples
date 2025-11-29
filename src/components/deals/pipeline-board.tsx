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
import { AlertCircle } from 'lucide-react';
import type { PipelineStage } from '@/types/deal';

interface PipelineBoardProps {
  stages: PipelineStage[];
}

export function PipelineBoard({ stages }: PipelineBoardProps) {
  if (stages.length === 0) {
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
    <div 
      className="w-full overflow-x-auto overflow-y-hidden"
      role="region"
      aria-label="Pipeline de vendas"
    >
      {/* Mobile: Vertical Stack | Desktop: Horizontal Scroll */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 sm:min-w-max">
        {stages.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={stage.deals}
          />
        ))}
      </div>
    </div>
  );
}
