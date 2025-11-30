import dynamic from 'next/dynamic';

// Dynamic import para ConversionReport (code splitting)
const ConversionReport = dynamic(
  () => import('@/components/reports/conversion-report').then(mod => mod.ConversionReport),
  {
    loading: () => <ReportSkeleton />,
    ssr: false, // Client-side only para gráficos pesados
  }
);

import { ReportSkeleton } from '@/components/reports/report-skeleton';

export default function ConversionReportPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Relatório de Conversão</h1>
        <p className="text-muted-foreground">
          Análise detalhada do funil de vendas e taxas de conversão por estágio
        </p>
      </div>

      <ConversionReport />
    </div>
  );
}
