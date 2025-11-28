// ============================================
// API: Automations/[id] - GET, PATCH, DELETE
// Sprint 3 - US-026
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateAutomationRuleSchema } from '@/types/automation';
import type { AutomationRule } from '@/types/automation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/automations/[id] - Detalhes da regra
// ============================================

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to automation details');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Buscar automação
    const { data: automation, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // RLS garante, mas é bom ser explícito
      .single();

    if (error) {
      logger.error('Failed to fetch automation rule', {
        error: error.message,
        automationId: id,
        userId: user.id,
      });

      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json({ error: 'Automação não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Erro ao buscar automação' }, { status: 500 });
    }

    logger.debug('Automation rule fetched successfully', {
      automationId: id,
      userId: user.id,
    });

    return NextResponse.json({
      automation: automation as AutomationRule,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/automations/[id]', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================
// PATCH /api/automations/[id] - Atualizar regra
// ============================================

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to update automation');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Parsear body
    const body = await request.json();

    // Validar com Zod (schema parcial)
    const validation = updateAutomationRuleSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid automation rule update data', {
        errors: validation.error.issues,
        automationId: id,
        userId: user.id,
      });
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Atualizar no banco
    const { data: automation, error } = await supabase
      .from('automation_rules')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        is_active: validatedData.is_active,
        trigger_type: validatedData.trigger_type,
        trigger_conditions: validatedData.trigger_conditions,
        actions: validatedData.actions,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update automation rule', {
        error: error.message,
        automationId: id,
        userId: user.id,
      });

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Automação não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Erro ao atualizar automação' }, { status: 500 });
    }

    logger.info('Automation rule updated successfully', {
      automationId: id,
      name: automation.name,
      userId: user.id,
    });

    return NextResponse.json({
      automation: automation as AutomationRule,
      message: 'Automação atualizada com sucesso',
    });
  } catch (error) {
    logger.error('Unexpected error in PATCH /api/automations/[id]', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/automations/[id] - Deletar regra
// ============================================

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to delete automation');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Deletar do banco (cascade vai deletar logs também)
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete automation rule', {
        error: error.message,
        automationId: id,
        userId: user.id,
      });

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Automação não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Erro ao deletar automação' }, { status: 500 });
    }

    logger.info('Automation rule deleted successfully', {
      automationId: id,
      userId: user.id,
    });

    return NextResponse.json({
      message: 'Automação deletada com sucesso',
    });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/automations/[id]', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
