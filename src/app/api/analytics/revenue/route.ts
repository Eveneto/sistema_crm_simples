/**
 * GET /api/analytics/revenue
 * Análise de receita realizada vs esperada
 * 
 * Seguindo Clean Code:
 * - Tratamento de erros consistente
 * - Early returns
 * - Logging adequado
 * - Responses padronizados
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  buildRevenueData,
  calculateDateRange,
} from '@/lib/services/analyticsService';
import type { AnalyticsPeriod } from '@/types/analytics';

// ============================================
// Helper: Validate Period
// ============================================

function isValidPeriod(period: string): period is AnalyticsPeriod {
  return ['7d', '30d', '90d', 'custom'].includes(period);
}

// ============================================
// GET Handler
// ============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Acesso não autorizado à API de analytics/revenue');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    // Validação
    if (!isValidPeriod(period)) {
      return NextResponse.json(
        { error: 'Período inválido. Use: 7d, 30d, 90d ou custom' },
        { status: 400 }
      );
    }

    // Custom period validation
    if (period === 'custom') {
      if (!customStart || !customEnd) {
        return NextResponse.json(
          { error: 'startDate e endDate são obrigatórios para período custom' },
          { status: 400 }
        );
      }
    }

    // Calcular date range
    const dateRange =
      period === 'custom' && customStart && customEnd
        ? { startDate: customStart, endDate: customEnd }
        : calculateDateRange(period as '7d' | '30d' | '90d');

    // Buscar dados
    const revenueData = await buildRevenueData(supabase, user.id, dateRange);

    logger.info('Relatório de receita gerado', {
      user_id: user.id,
      period,
      realized_total: revenueData.realized.total,
      expected_total: revenueData.expected.total,
    });

    return NextResponse.json(revenueData);
  } catch (error) {
    logger.error('Erro ao gerar relatório de receita', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
