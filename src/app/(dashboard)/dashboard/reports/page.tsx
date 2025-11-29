import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download, BarChart3, ArrowRight } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      title: 'Relatório de Conversão',
      description: 'Análise detalhada do funil de vendas com taxas de conversão por estágio',
      href: '/dashboard/reports/conversion',
      icon: TrendingUp,
      color: 'text-blue-600',
      available: true,
    },
    {
      title: 'Exportar Dados',
      description: 'Exporte contatos, negócios e tarefas em formato CSV',
      href: '/dashboard/reports/export',
      icon: Download,
      color: 'text-green-600',
      available: true,
    },
    {
      title: 'Analytics Avançado',
      description: 'Dashboard com métricas avançadas, previsões e análises de performance',
      href: '/dashboard/reports/analytics',
      icon: BarChart3,
      color: 'text-purple-600',
      available: false, // Será implementado em US-031
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Visualize métricas, análises e exporte dados do seu CRM
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          
          return (
            <Card key={report.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    {!report.available && (
                      <span className="text-xs text-muted-foreground">(Em breve)</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {report.description}
                </CardDescription>
                
                {report.available ? (
                  <Link href={report.href}>
                    <Button className="w-full" variant="default">
                      Acessar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Em desenvolvimento
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">✅ Disponível: Relatório de Conversão</h3>
            <p className="text-sm text-muted-foreground">
              Visualize o funil de vendas completo com métricas de conversão entre estágios,
              tempo médio em cada fase e análise de performance do pipeline.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">✅ Disponível: Exportar Dados</h3>
            <p className="text-sm text-muted-foreground">
              Exporte seus dados (contatos, negócios, tarefas) em formato CSV para análise
              externa ou backup. Download instantâneo com todos os campos formatados.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">🚧 Em desenvolvimento: Analytics Avançado</h3>
            <p className="text-sm text-muted-foreground">
              Dashboard completo com análise de receita, distribuição de pipeline, métricas de
              performance e previsões baseadas em dados históricos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
