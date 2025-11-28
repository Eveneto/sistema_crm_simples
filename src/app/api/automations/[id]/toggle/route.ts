// ============================================
// API: Automations/[id]/toggle - POST
// Sprint 3 - US-026
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// ============================================
// POST /api/automations/[id]/toggle - Ativar/Desativar regra
// ============================================

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to toggle automation');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Buscar regra atual
    const { data: currentRule, error: fetchError } = await supabase
      .from('automation_rules')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch automation rule for toggle', {
        error: fetchError.message,
        automationId: id,
        userId: user.id,
      });

      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Automação não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Erro ao buscar automação' }, { status: 500 });
    }

    // Inverter o status
    const newStatus = !currentRule.is_active;

    // Atualizar no banco
    const { data: automation, error: updateError } = await supabase
      .from('automation_rules')
      .update({ is_active: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to toggle automation rule', {
        error: updateError.message,
        automationId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erro ao alterar status da automação' }, { status: 500 });
    }

    logger.info('Automation rule toggled successfully', {
      automationId: id,
      newStatus,
      userId: user.id,
    });

    return NextResponse.json({
      automation,
      message: `Automação ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/automations/[id]/toggle', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
