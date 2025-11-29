/**
 * GET /api/analytics/performance
 * Métricas de performance (win rate, ticket médio, ciclo de vendas)
 * 
 * Seguindo Clean Code:
 * - DRY: reutiliza helpers
 * - Early returns
 * - Nomes descritivos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  buildPerformanceMetrics,
  calculateDateRange,
} from '@/lib/services/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Acesso não autorizado à API de analytics/performance');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calcular date range
    const dateRange = calculateDateRange(period as '7d' | '30d' | '90d');

    // Buscar métricas
    const performanceMetrics = await buildPerformanceMetrics(
      supabase,
      user.id,
      dateRange
    );

    logger.info('Métricas de performance geradas', {
      user_id: user.id,
      period,
      win_rate: performanceMetrics.winRate.current,
      avg_ticket: performanceMetrics.averageTicket.current,
    });

    return NextResponse.json(performanceMetrics);
  } catch (error) {
    logger.error('Erro ao gerar métricas de performance', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
