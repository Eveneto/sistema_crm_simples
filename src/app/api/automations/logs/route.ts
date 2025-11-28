// ============================================
// API: Automations/logs - GET
// Sprint 3 - US-026
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/automations/logs - Listar logs de execução
// ============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to automation logs');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const automation_rule_id = searchParams.get('automation_rule_id');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('automation_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('executed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros opcionais
    if (automation_rule_id) {
      query = query.eq('automation_rule_id', automation_rule_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch automation logs', {
        error: error.message,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erro ao buscar logs de automação' }, { status: 500 });
    }

    logger.debug('Automation logs fetched successfully', {
      userId: user.id,
      count: logs?.length || 0,
    });

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/automations/logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
