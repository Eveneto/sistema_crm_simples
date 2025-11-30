'use client';

import { useState } from 'react';
import { DashboardGrid, PeriodFilter } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { DashboardTasksWidget } from '@/components/dashboard/dashboard-tasks-widget';

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader onPeriodChange={setPeriod} />
      <DashboardGrid period={period} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <DashboardTasksWidget />
        </div>
      </div>
    </div>
  );
}
