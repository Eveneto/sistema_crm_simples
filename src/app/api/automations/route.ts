// ============================================
// API: Automations - GET (list) e POST (create)
// Sprint 3 - US-026
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAutomationRuleSchema } from '@/types/automation';
import type { AutomationRule } from '@/types/automation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/automations - Listar regras do usuário
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
      logger.warn('Unauthorized access to automations API');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const is_active = searchParams.get('is_active'); // 'true', 'false', ou null (todos)
    const trigger_type = searchParams.get('trigger_type');

    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('automation_rules')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros opcionais
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (trigger_type) {
      query = query.eq('trigger_type', trigger_type);
    }

    const { data: automations, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch automation rules', {
        error: error.message,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erro ao buscar automações' }, { status: 500 });
    }

    logger.debug('Automation rules fetched successfully', {
      userId: user.id,
      count: automations?.length || 0,
    });

    return NextResponse.json({
      automations: automations || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/automations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================
// POST /api/automations - Criar nova regra
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access to create automation');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parsear body
    const body = await request.json();

    // Validar com Zod
    const validation = createAutomationRuleSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid automation rule data', {
        errors: validation.error.issues,
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

    // Inserir no banco
    const { data: automation, error } = await supabase
      .from('automation_rules')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        is_active: validatedData.is_active,
        trigger_type: validatedData.trigger_type,
        trigger_conditions: validatedData.trigger_conditions,
        actions: validatedData.actions,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create automation rule', {
        error: error.message,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erro ao criar automação' }, { status: 500 });
    }

    logger.info('Automation rule created successfully', {
      automationId: automation.id,
      name: automation.name,
      userId: user.id,
    });

    return NextResponse.json(
      {
        automation: automation as AutomationRule,
        message: 'Automação criada com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Unexpected error in POST /api/automations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
