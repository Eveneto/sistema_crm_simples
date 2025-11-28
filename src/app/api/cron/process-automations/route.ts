// ============================================
// API: Cron Job - Processar Automações
// Sprint 3 - US-026
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { AutomationRule, TriggerConditions, AutomationAction } from '@/types/automation';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/cron/process-automations
// Executado pelo Vercel Cron a cada 5 minutos
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Validar authorization header (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      logger.warn('Unauthorized cron job execution attempt');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    logger.info('Starting automation processing cron job');

    const supabase = await createClient();

    // 1. Buscar todas as regras ativas
    const { data: activeRules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      logger.error('Failed to fetch active automation rules', {
        error: rulesError.message,
      });
      return NextResponse.json({ error: 'Erro ao buscar regras ativas' }, { status: 500 });
    }

    if (!activeRules || activeRules.length === 0) {
      logger.info('No active automation rules found');
      return NextResponse.json({
        processed: 0,
        message: 'Nenhuma regra ativa encontrada',
      });
    }

    logger.info(`Processing ${activeRules.length} active automation rules`);

    let totalProcessed = 0;
    let totalActionsExecuted = 0;
    let totalErrors = 0;

    // 2. Para cada regra, processar
    for (const rule of activeRules as AutomationRule[]) {
      try {
        const result = await processAutomationRule(supabase, rule);
        totalProcessed++;
        totalActionsExecuted += result.actionsExecuted;
        totalErrors += result.errors;
      } catch (error) {
        logger.error('Error processing automation rule', {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        totalErrors++;
      }
    }

    // 3. Atualizar last_executed_at das regras processadas
    await supabase
      .from('automation_rules')
      .update({ last_executed_at: new Date().toISOString() })
      .in(
        'id',
        activeRules.map((r) => r.id)
      );

    logger.info('Automation processing completed', {
      rulesProcessed: totalProcessed,
      actionsExecuted: totalActionsExecuted,
      errors: totalErrors,
    });

    return NextResponse.json({
      processed: totalProcessed,
      actionsExecuted: totalActionsExecuted,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Unexpected error in automation cron job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================
// Helper: Processar uma regra específica
// ============================================

interface ProcessResult {
  actionsExecuted: number;
  errors: number;
}

async function processAutomationRule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  rule: AutomationRule
): Promise<ProcessResult> {
  let actionsExecuted = 0;
  let errors = 0;

  try {
    // Encontrar negócios que atendem às condições
    const matchingDeals = await findMatchingDeals(supabase, rule);

    if (matchingDeals.length === 0) {
      logger.debug('No matching deals found', { ruleId: rule.id });
      return { actionsExecuted: 0, errors: 0 };
    }

    logger.info(`Found ${matchingDeals.length} matching deals`, {
      ruleId: rule.id,
    });

    // Executar ações para cada negócio
    for (const deal of matchingDeals) {
      try {
        await executeAutomationActions(supabase, rule, deal);
        actionsExecuted += rule.actions.length;

        // Log de sucesso
        await logAutomationExecution(
          supabase,
          rule.id,
          deal.id,
          rule.user_id,
          'success',
          rule.actions
        );
      } catch (error) {
        errors++;
        logger.error('Failed to execute automation actions', {
          ruleId: rule.id,
          dealId: deal.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Log de erro
        await logAutomationExecution(
          supabase,
          rule.id,
          deal.id,
          rule.user_id,
          'error',
          [],
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  } catch (error) {
    logger.error('Error in processAutomationRule', {
      ruleId: rule.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    errors++;
  }

  return { actionsExecuted, errors };
}

// ============================================
// Helper: Encontrar negócios que atendem condições
// ============================================

async function findMatchingDeals(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  rule: AutomationRule
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const { trigger_type, trigger_conditions } = rule;

  // Por enquanto, implementando apenas time_based
  // Outras condições serão implementadas incrementalmente
  if (trigger_type === 'time_based') {
    return findTimeBasedMatches(supabase, trigger_conditions, rule.user_id);
  }

  // Outros tipos de trigger serão implementados
  logger.debug('Trigger type not yet implemented', {
    triggerType: trigger_type,
    ruleId: rule.id,
  });
  return [];
}

// ============================================
// Helper: Encontrar negócios parados há X dias
// ============================================

async function findTimeBasedMatches(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  conditions: TriggerConditions,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const { days_inactive } = conditions;

  if (!days_inactive) {
    return [];
  }

  // Calcular data limite (agora - X dias)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days_inactive);

  // Buscar negócios que não foram atualizados desde a data limite
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .lt('updated_at', cutoffDate.toISOString())
    .neq('status', 'won') // Não processar negócios ganhos
    .neq('status', 'lost'); // Não processar negócios perdidos

  if (error) {
    logger.error('Failed to find time-based matches', {
      error: error.message,
      userId,
    });
    return [];
  }

  return deals || [];
}

// ============================================
// Helper: Executar ações da automação
// ============================================

async function executeAutomationActions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  rule: AutomationRule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deal: any
): Promise<void> {
  for (const action of rule.actions) {
    await executeAction(supabase, action, deal, rule.user_id);
  }
}

// ============================================
// Helper: Executar uma ação específica
// ============================================

async function executeAction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  action: AutomationAction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deal: any,
  _userId: string
): Promise<void> {
  switch (action.type) {
    case 'move_stage':
      if (action.target_stage) {
        await supabase.from('deals').update({ stage: action.target_stage }).eq('id', deal.id);

        logger.info('Moved deal to new stage', {
          dealId: deal.id,
          targetStage: action.target_stage,
        });
      }
      break;

    case 'send_notification':
      // Será implementado quando tivermos a tabela de notificações (US-027)
      logger.debug('Notification action skipped (not yet implemented)', {
        dealId: deal.id,
      });
      break;

    case 'create_task':
      // Será implementado quando tivermos a tabela de tasks (US-028)
      logger.debug('Task creation skipped (not yet implemented)', {
        dealId: deal.id,
      });
      break;

    case 'add_tag':
      if (action.tag) {
        const currentTags = deal.tags || [];
        if (!currentTags.includes(action.tag)) {
          await supabase
            .from('deals')
            .update({ tags: [...currentTags, action.tag] })
            .eq('id', deal.id);

          logger.info('Added tag to deal', {
            dealId: deal.id,
            tag: action.tag,
          });
        }
      }
      break;

    default:
      logger.warn('Unknown action type', { actionType: action.type });
  }
}

// ============================================
// Helper: Registrar log de execução
// ============================================

async function logAutomationExecution(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  ruleId: string,
  dealId: string,
  _userId: string,
  status: 'success' | 'error' | 'skipped',
  actionsPerformed: AutomationAction[],
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('automation_logs').insert({
      automation_rule_id: ruleId,
      deal_id: dealId,
      user_id: _userId,
      status,
      actions_performed: actionsPerformed,
      error_message: errorMessage,
    });
  } catch (error) {
    logger.error('Failed to log automation execution', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ruleId,
      dealId,
    });
  }
}
