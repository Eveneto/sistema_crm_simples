import { ConversionReport } from '@/components/reports/conversion-report';

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
