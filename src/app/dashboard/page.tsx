'use client';

import { useState } from 'react';
import { DashboardGrid, PeriodFilter } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SalesChart } from '@/components/dashboard/sales-chart';

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader onPeriodChange={setPeriod} />
      <DashboardGrid period={period} />
      <SalesChart />
    </div>
  );
}
