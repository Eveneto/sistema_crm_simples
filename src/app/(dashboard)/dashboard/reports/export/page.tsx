import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ExportButton } from '@/components/export/export-button';
import { Users, FolderKanban, CheckSquare, FileText } from 'lucide-react';

export default function ExportPage() {
  const exportOptions = [
    {
      title: 'Contatos',
      description: 'Exporte todos os seus contatos com informações completas',
      icon: Users,
      endpoint: '/api/export/contacts',
      filename: 'contatos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      fields: ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Origem', 'Tags', 'Notas', 'Datas'],
    },
    {
      title: 'Negócios',
      description: 'Exporte todos os negócios do seu pipeline de vendas',
      icon: FolderKanban,
      endpoint: '/api/export/deals',
      filename: 'negocios',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      fields: [
        'Título',
        'Valor',
        'Estágio',
        'Probabilidade',
        'Data Esperada',
        'Contato',
        'Descrição',
        'Datas',
      ],
    },
    {
      title: 'Tarefas',
      description: 'Exporte todas as suas tarefas e lembretes',
      icon: CheckSquare,
      endpoint: '/api/export/tasks',
      filename: 'tarefas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      fields: [
        'Título',
        'Descrição',
        'Status',
        'Prioridade',
        'Vencimento',
        'Lembrete',
        'Negócio',
        'Contato',
        'Datas',
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exportar Dados</h1>
        <p className="text-muted-foreground mt-2">
          Exporte seus dados em formato CSV para análise externa ou backup
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {exportOptions.map((option) => {
          const Icon = option.icon;

          return (
            <Card key={option.endpoint} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg ${option.bgColor}`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </div>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Campos incluídos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {option.fields.map((field) => (
                      <span key={field} className="text-xs bg-muted px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <ExportButton
                  endpoint={option.endpoint}
                  filename={option.filename}
                  label={`Exportar ${option.title}`}
                  variant="default"
                  size="default"
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Informações sobre exportação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Sobre a Exportação de Dados</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">📋 Formato do Arquivo</h3>
            <p className="text-sm text-muted-foreground">
              Os dados são exportados em formato CSV (Comma-Separated Values), compatível com Excel,
              Google Sheets e outras ferramentas de análise.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🔒 Segurança</h3>
            <p className="text-sm text-muted-foreground">
              Apenas os dados do seu usuário são exportados. As exportações são geradas em tempo
              real e não são armazenadas no servidor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">📊 Como Usar</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Clique no botão &quot;Exportar&quot; do tipo de dado desejado</li>
              <li>O arquivo CSV será baixado automaticamente para seu computador</li>
              <li>Abra o arquivo com Excel, Google Sheets ou qualquer editor de planilhas</li>
              <li>Os dados estarão organizados em colunas com cabeçalhos descritivos</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">💡 Dicas</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Use exportações regulares como backup dos seus dados</li>
              <li>Importe os CSVs em ferramentas de análise para insights avançados</li>
              <li>O nome do arquivo inclui a data da exportação para facilitar organização</li>
              <li>Caracteres especiais e acentos são preservados corretamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
