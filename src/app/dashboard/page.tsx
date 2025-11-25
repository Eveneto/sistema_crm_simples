import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, FolderKanban, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // TODO: Buscar dados reais do Supabase nas próximas sprints
  const stats = [
    {
      title: 'Contatos',
      value: '0',
      description: 'Total de contatos cadastrados',
      icon: Users,
      trend: '+0%',
    },
    {
      title: 'Conversas Ativas',
      value: '0',
      description: 'Conversas em andamento',
      icon: MessageSquare,
      trend: '+0%',
    },
    {
      title: 'Negócios Abertos',
      value: '0',
      description: 'Oportunidades em progresso',
      icon: FolderKanban,
      trend: '+0%',
    },
    {
      title: 'Taxa de Conversão',
      value: '0%',
      description: 'Negócios ganhos/total',
      icon: TrendingUp,
      trend: '+0%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="mt-1 text-xs text-green-600">{stat.trend} vs último mês</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximas Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Atividades</CardTitle>
          <CardDescription>Você não tem atividades agendadas para hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma atividade encontrada. Comece criando contatos e negócios!
          </p>
        </CardContent>
      </Card>

      {/* Conversas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
          <CardDescription>Últimas interações com clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma conversa iniciada ainda. Configure seus canais de atendimento!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
