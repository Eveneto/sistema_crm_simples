import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  won: 'Ganho',
  lost: 'Perdido',
};

/**
 * GET /api/export/deals
 * Exporta todos os negócios do usuário em formato JSON
 * O cliente converte para CSV usando papaparse
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar todos os negócios do usuário com relações
    const { data: deals, error } = (await supabase
      .from('deals')
      .select('*, contacts(name, email), activities(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as any;

    if (error) {
      logger.error('Erro ao exportar negócios:', { error, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao exportar negócios' }, { status: 500 });
    }

    // Formatar dados para exportação
    const exportData =
      deals?.map((deal: any) => ({
        ID: deal.id,
        Título: deal.title,
        Valor: deal.value || 0,
        Estágio: stageLabels[deal.stage] || deal.stage,
        'Probabilidade (%)': deal.probability || 0,
        'Data Esperada': deal.expected_close_date
          ? new Date(deal.expected_close_date).toLocaleDateString('pt-BR')
          : '',
        Contato: deal.contacts?.name || '',
        'Email do Contato': deal.contacts?.email || '',
        Descrição: deal.description || '',
        Notas: deal.notes || '',
        'Data de Criação': new Date(deal.created_at).toLocaleString('pt-BR'),
        'Última Atualização': new Date(deal.updated_at).toLocaleString('pt-BR'),
      })) || [];

    logger.info('Negócios exportados com sucesso', {
      user_id: user.id,
      count: exportData.length,
    });

    return NextResponse.json({
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro inesperado ao exportar negócios:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
