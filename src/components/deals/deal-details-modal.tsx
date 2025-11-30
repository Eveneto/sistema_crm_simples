/**
 * Deal Details Modal Component
 * Modal para exibir detalhes completos de um negócio
 *
 * Clean Code:
 * - Componente focado em exibir dados
 * - Reutiliza componentes existentes
 * - Separação clara de responsabilidades
 */

'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, DollarSign, User, Target, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import type { DealWithRelations } from '@/types/deal';

interface DealDetailsModalProps {
  deal: DealWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (deal: DealWithRelations) => void;
}

function DetailRow({ label, value, icon: Icon }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Ativo', icon: CheckCircle, variant: 'default' as const },
    won: { label: 'Ganho', icon: CheckCircle, variant: 'default' as const },
    lost: { label: 'Perdido', icon: XCircle, variant: 'destructive' as const },
    inactive: { label: 'Inativo', icon: Clock, variant: 'secondary' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export function DealDetailsModal({ deal, isOpen, onClose, onEdit }: DealDetailsModalProps) {
  if (!deal) return null;

  const handleEdit = () => {
    onEdit?.(deal);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {deal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <DetailRow
              label="Valor"
              value={formatCurrency(deal.value || 0)}
              icon={DollarSign}
            />

            <DetailRow
              label="Contato"
              value={
                deal.contact ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{deal.contact.name}</span>
                    {deal.contact.email && (
                      <span className="text-xs text-muted-foreground">
                        ({deal.contact.email})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Não informado</span>
                )
              }
            />

            <DetailRow
              label="Estágio"
              value={
                deal.stage ? (
                  <Badge
                    variant="outline"
                    style={{ borderColor: deal.stage.color, color: deal.stage.color }}
                  >
                    {deal.stage.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Não definido</span>
                )
              }
            />

            <DetailRow
              label="Status"
              value={<StatusBadge status={deal.status} />}
            />
          </div>

          <Separator />

          {/* Datas */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datas
            </h4>

            <DetailRow
              label="Criado em"
              value={
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(deal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              }
            />

            {deal.updated_at && deal.updated_at !== deal.created_at && (
              <DetailRow
                label="Última atualização"
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(deal.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                }
              />
            )}

            {deal.expected_close_date && (
              <DetailRow
                label="Fechamento esperado"
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(deal.expected_close_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                }
              />
            )}
          </div>

        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {onEdit && (
            <Button onClick={handleEdit}>
              Editar Negócio
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
