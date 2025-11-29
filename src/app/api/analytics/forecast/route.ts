/**
 * GET /api/analytics/forecast
 * Projeção de receita futura (3 cenários: pessimista, realista, otimista)
 * 
 * Seguindo Clean Code:
 * - Validação de input
 * - Defaults claros
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { buildForecast } from '@/lib/services/analyticsService';

const DEFAULT_FORECAST_MONTHS = 3;
const MAX_FORECAST_MONTHS = 12;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Acesso não autorizado à API de analytics/forecast');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Query parameters
    const searchParams = request.nextUrl.searchParams;
    const monthsParam = searchParams.get('months');
    const months = monthsParam ? parseInt(monthsParam) : DEFAULT_FORECAST_MONTHS;

    // Validação
    if (isNaN(months) || months < 1 || months > MAX_FORECAST_MONTHS) {
      return NextResponse.json(
        { error: `Meses deve estar entre 1 e ${MAX_FORECAST_MONTHS}` },
        { status: 400 }
      );
    }

    // Gerar forecast
    const forecastData = await buildForecast(supabase, user.id, months);

    logger.info('Forecast gerado', {
      user_id: user.id,
      months,
      deals_in_pipeline: forecastData.basis.dealsInPipeline,
      confidence: forecastData.confidence,
    });

    return NextResponse.json(forecastData);
  } catch (error) {
    logger.error('Erro ao gerar forecast', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
