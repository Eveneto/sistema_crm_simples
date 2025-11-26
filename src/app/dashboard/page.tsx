import { Metadata } from 'next';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export const metadata: Metadata = {
  title: 'Dashboard | CRM Simplificado',
  description: 'Visão geral das métricas e indicadores do CRM',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <DashboardGrid />
    </div>
  );
}
