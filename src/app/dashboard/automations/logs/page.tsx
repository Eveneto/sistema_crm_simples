// ============================================
// Page: /dashboard/automations/logs
// Sprint 3 - US-026
// ============================================

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const metadata: Metadata = {
  title: 'Logs de Automação | CRM',
  description: 'Histórico de execuções de automações',
};

type AutomationLog = {
  id: string;
  automation_rule_id: string;
  automation_name: string;
  deal_id: string | null;
  contact_id: string | null;
  status: 'success' | 'error' | 'partial';
  error_message: string | null;
  executed_actions: unknown;
  execution_time_ms: number;
  created_at: string;
};

export default async function AutomationLogsPage() {
  const supabase = await createClient();

  // Buscar logs (últimos 100)
  const { data: logs, error } = await supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    logger.error('Error fetching automation logs', { error });
  }

  const logsData = (logs as AutomationLog[]) || [];

  // Calcular estatísticas
  const totalLogs = logsData.length;
  const successCount = logsData.filter((log) => log.status === 'success').length;
  const errorCount = logsData.filter((log) => log.status === 'error').length;
  const partialCount = logsData.filter((log) => log.status === 'partial').length;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/automations">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Logs de Automação</h1>
        <p className="text-muted-foreground mt-2">Histórico de execuções e resultados</p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Parcial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
          <CardDescription>Últimas 100 execuções de automações</CardDescription>
        </CardHeader>
        <CardContent>
          {logsData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum log encontrado</p>
          ) : (
            <div className="space-y-4">
              {logsData.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{log.automation_name}</span>
                      {log.status === 'success' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Sucesso
                        </Badge>
                      )}
                      {log.status === 'error' && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                      {log.status === 'partial' && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Parcial
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>ID da Automação: {log.automation_rule_id}</p>
                      {log.deal_id && <p>Deal ID: {log.deal_id}</p>}
                      {log.contact_id && <p>Contato ID: {log.contact_id}</p>}
                      {log.error_message && (
                        <p className="text-red-600">Erro: {log.error_message}</p>
                      )}
                      <p>Tempo de execução: {log.execution_time_ms}ms</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <time className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
