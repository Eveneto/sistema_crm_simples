/**
 * Deal Card Component
 * Card individual de negócio no Kanban
 * 
 * Clean Code:
 * - Single Responsibility: Apenas exibir dados do deal
 * - Pequeno e focado
 * - Props tipadas
 */

'use client';

import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { DealWithRelations } from '@/types/deal';

interface DealCardProps {
  deal: DealWithRelations;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
  // Status badge color
  const statusColor = {
    active: 'bg-blue-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  }[deal.status];

  return (
    <Card 
      className={`
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
    >
      <CardContent className="p-4 space-y-2">
        {/* Título */}
        <h3 className="font-semibold text-sm line-clamp-2">
          {deal.title}
        </h3>

        {/* Valor */}
        {deal.value && deal.value > 0 && (
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(deal.value)}
          </p>
        )}

        {/* Contato */}
        {deal.contact && (
          <p className="text-xs text-muted-foreground truncate">
            👤 {deal.contact.name}
          </p>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${statusColor} text-white text-xs`}
          >
            {deal.status === 'active' && 'Ativo'}
            {deal.status === 'won' && 'Ganho'}
            {deal.status === 'lost' && 'Perdido'}
          </Badge>
          
          {/* Data de criação */}
          <span className="text-xs text-muted-foreground">
            {new Date(deal.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
