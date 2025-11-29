/**
 * GET /api/analytics/trends
 * Análise de tendências históricas (month-over-month, year-over-year)
 * 
 * Seguindo Clean Code:
 * - Sem lógica complexa na rota
 * - Delega para service layer
 * - Logging consistente
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { buildTrendsData } from '@/lib/services/analyticsService';

export async function GET() {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Acesso não autorizado à API de analytics/trends');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Gerar trends
    const trendsData = await buildTrendsData(supabase, user.id);

    logger.info('Análise de tendências gerada', {
      user_id: user.id,
      months_analyzed: trendsData.monthOverMonth.length,
      current_year_revenue: trendsData.yearOverYear.currentYear,
    });

    return NextResponse.json(trendsData);
  } catch (error) {
    logger.error('Erro ao gerar análise de tendências', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
