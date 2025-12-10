'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardGrid, PeriodFilter } from '@/components/dashboard/dashboard-grid';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

// Lazy load heavy components
const SalesChart = dynamic(() => import('@/components/dashboard/sales-chart').then(mod => ({ default: mod.SalesChart })), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
});

const DashboardTasksWidget = dynamic(() => import('@/components/dashboard/dashboard-tasks-widget').then(mod => ({ default: mod.DashboardTasksWidget })), {
  loading: () => <div className="h-80 bg-muted animate-pulse rounded-lg" />,
});

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader onPeriodChange={setPeriod} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardGrid period={period} />
      </Suspense>

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
