/**
 * Deal Card Component
 * Card individual de negócio no Kanban com Drag and Drop
 * 
 * Clean Code:
 * - Single Responsibility: Apenas exibir dados do deal
 * - Pequeno e focado
 * - Props tipadas
 */

'use client';

import { Draggable } from '@hello-pangea/dnd';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { DealWithRelations } from '@/types/deal';

interface DealCardProps {
  deal: DealWithRelations;
  index: number;
  onEdit?: (deal: DealWithRelations) => void;
  onView?: (deal: DealWithRelations) => void;
}

export function DealCard({ deal, index, onEdit, onView }: DealCardProps) {
  // Status badge color
  const statusColor = {
    active: 'bg-blue-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  }[deal.status];

  const handleClick = () => {
    if (onView) {
      onView(deal);
    } else if (onEdit) {
      onEdit(deal);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal);
  };

  const statusLabel = {
    active: 'Ativo',
    won: 'Ganho',
    lost: 'Perdido',
  }[deal.status];

  return (
    <Draggable
      draggableId={deal.id}
      index={index}
      isDragDisabled={deal.status !== 'active'}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            ${onView || onEdit ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
            hover:shadow-lg hover:scale-[1.02] hover:border-primary/50
            transition-all duration-200 ease-out group
            ${snapshot.isDragging ? 'opacity-50 shadow-2xl scale-105 rotate-2' : ''}
            ${deal.status !== 'active' ? 'opacity-60' : ''}
          `}
          onClick={handleClick}
          role="article"
          aria-label={`Negócio: ${deal.title}`}
        >
          <CardContent className="p-4 space-y-2">
            {/* Título */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {deal.title}
            </h3>

            {/* Valor */}
            {deal.value && deal.value > 0 && (
              <p className="text-lg font-bold text-green-600 transition-transform hover:scale-105">
                {formatCurrency(deal.value)}
              </p>
            )}

            {/* Contato */}
            {deal.contact && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span aria-hidden="true">👤</span>
                <span>{deal.contact.name}</span>
              </p>
            )}

            {/* Status Badge */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${statusColor} text-white text-xs transition-transform hover:scale-110`}
                >
                  {statusLabel}
                </Badge>

                {/* Data de criação */}
                <span className="text-xs text-muted-foreground">
                  {new Date(deal.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>

              {/* Botão de editar */}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleEditClick}
                  aria-label="Editar negócio"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
