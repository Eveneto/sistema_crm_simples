'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type PeriodFilter = '7d' | '30d' | '90d';

interface DashboardHeaderProps {
  onPeriodChange?: (period: PeriodFilter) => void;
}

export function DashboardHeader({ onPeriodChange }: DashboardHeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('30d');

  const handlePeriodChange = (period: PeriodFilter) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedPeriod === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('7d')}
        >
          7 dias
        </Button>
        <Button
          variant={selectedPeriod === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('30d')}
        >
          30 dias
        </Button>
        <Button
          variant={selectedPeriod === '90d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('90d')}
        >
          90 dias
        </Button>
      </div>
    </div>
  );
}
