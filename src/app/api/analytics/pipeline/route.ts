/**
 * GET /api/analytics/pipeline
 * Distribuição do pipeline por valor e quantidade
 * 
 * Seguindo Clean Code:
 * - Single Responsibility (apenas pipeline)
 * - Tratamento de erros
 * - Logging estruturado
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { buildPipelineDistribution } from '@/lib/services/analyticsService';

export async function GET() {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Acesso não autorizado à API de analytics/pipeline');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados
    const pipelineData = await buildPipelineDistribution(supabase, user.id);

    logger.info('Distribuição de pipeline gerada', {
      user_id: user.id,
      total_deals: pipelineData.total.count,
      total_value: pipelineData.total.value,
    });

    return NextResponse.json(pipelineData);
  } catch (error) {
    logger.error('Erro ao gerar distribuição de pipeline', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
