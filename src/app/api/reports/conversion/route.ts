import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ConversionMetrics {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  avgTimeInStage: number; // em dias
}

export interface ConversionReport {
  metrics: ConversionMetrics[];
  totalDeals: number;
  totalValue: number;
  overallConversionRate: number;
  avgSalesCycle: number; // tempo médio total em dias
}

/**
 * GET /api/reports/conversion
 * Retorna relatório de conversão do funil de vendas
 */
export async function GET() {
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

    // Buscar todos os negócios do usuário
    const { data: deals, error: dealsError } = (await supabase
      .from('deals')
      .select('id, title, value, stage, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as any;

    if (dealsError) {
      logger.error('Erro ao buscar deals para relatório:', { error: dealsError, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
    }

    // Nota: Para versão futura, buscar histórico de atividades para calcular tempo preciso
    // Por enquanto, usamos a diferença entre created_at e updated_at do deal

    // Definir ordem dos estágios
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

    // Calcular métricas por estágio
    const stageMetrics: Record<string, { count: number; value: number; timesInDays: number[] }> =
      {};

    stageOrder.forEach((stage) => {
      stageMetrics[stage] = { count: 0, value: 0, timesInDays: [] };
    });

    // Contar deals por estágio
    deals?.forEach((deal: any) => {
      if (stageMetrics[deal.stage]) {
        stageMetrics[deal.stage].count++;
        stageMetrics[deal.stage].value += deal.value || 0;
      }
    });

    // Calcular tempo médio em cada estágio (simplificado)
    // Para uma implementação mais precisa, seria necessário um histórico de mudanças de estágio
    deals?.forEach((deal: any) => {
      const createdAt = new Date(deal.created_at);
      const updatedAt = new Date(deal.updated_at);
      const daysInStage = Math.floor(
        (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (stageMetrics[deal.stage]) {
        stageMetrics[deal.stage].timesInDays.push(daysInStage);
      }
    });

    // Calcular métricas de conversão
    const metrics: ConversionMetrics[] = [];
    let previousCount = deals?.length || 0;

    stageOrder.forEach((stage, index) => {
      const data = stageMetrics[stage];
      const avgTimeInStage =
        data.timesInDays.length > 0
          ? data.timesInDays.reduce((sum, time) => sum + time, 0) / data.timesInDays.length
          : 0;

      // Taxa de conversão = (deals neste estágio / deals no estágio anterior) * 100
      const conversionRate =
        index === 0
          ? 100 // Primeiro estágio sempre 100%
          : previousCount > 0
            ? (data.count / previousCount) * 100
            : 0;

      metrics.push({
        stage,
        count: data.count,
        value: data.value,
        conversionRate: Math.round(conversionRate * 10) / 10, // Arredondar para 1 casa decimal
        avgTimeInStage: Math.round(avgTimeInStage * 10) / 10,
      });

      // Não incluir 'lost' no cálculo de conversão para próximo estágio
      if (stage !== 'lost') {
        previousCount = data.count;
      }
    });

    // Calcular métricas gerais
    const totalDeals = deals?.length || 0;
    const totalValue = deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;
    const wonDeals = stageMetrics.won.count;
    const overallConversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Calcular ciclo de vendas médio (tempo desde lead até won)
    const wonDealsTimes =
      deals
        ?.filter((deal: any) => deal.stage === 'won')
        .map((deal: any) => {
          const createdAt = new Date(deal.created_at);
          const updatedAt = new Date(deal.updated_at);
          return Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        }) || [];

    const avgSalesCycle =
      wonDealsTimes.length > 0
        ? wonDealsTimes.reduce((sum: number, time: number) => sum + time, 0) / wonDealsTimes.length
        : 0;

    const report: ConversionReport = {
      metrics,
      totalDeals,
      totalValue,
      overallConversionRate: Math.round(overallConversionRate * 10) / 10,
      avgSalesCycle: Math.round(avgSalesCycle * 10) / 10,
    };

    logger.info('Relatório de conversão gerado com sucesso', {
      user_id: user.id,
      total_deals: totalDeals,
      won_deals: wonDeals,
    });

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Erro inesperado ao gerar relatório de conversão:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
