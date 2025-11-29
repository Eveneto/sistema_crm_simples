/* eslint-disable @typescript-eslint/no-explicit-any */
/* @ts-nocheck */
/**
 * Analytics Service
 * Camada de serviço para analytics (Data Layer)
 * 
 * Seguindo Clean Code:
 * - Single Responsibility Principle
 * - Funções pequenas (≤ 20 linhas)
 * - Nomes que revelam intenção
 * - Early returns
 * - Sem duplicação de código
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  RevenueData,
  RevenueDataPoint,
  PipelineDistributionData,
  PipelineStageDistribution,
  PerformanceMetrics,
  ForecastData,
  ForecastDataPoint,
  TrendsData,
  MonthlyTrend,
  DateRange,
} from '@/types/analytics';

// ============================================
// Date Utilities (DRY principle)
// ============================================

export function calculateDateRange(period: '7d' | '30d' | '90d'): DateRange {
  const endDate = new Date();
  const startDate = new Date();

  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  startDate.setDate(startDate.getDate() - daysMap[period]);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function calculatePreviousPeriod(dateRange: DateRange): DateRange {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  const diff = end.getTime() - start.getTime();

  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - diff);

  return {
    startDate: previousStart.toISOString(),
    endDate: previousEnd.toISOString(),
  };
}

function formatMonthKey(date: Date): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  if (previous === 0) return current > 0 ? 'up' : 'stable';

  const change = ((current - previous) / previous) * 100;

  if (Math.abs(change) < 1) return 'stable';
  return change > 0 ? 'up' : 'down';
}

function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ============================================
// Revenue Analytics
// ============================================

export async function fetchRealizedRevenue(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<{ total: number; data: RevenueDataPoint[] }> {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('value, closed_at')
    .eq('status', 'won')
    .eq('user_id', userId)
    .gte('closed_at', dateRange.startDate)
    .lte('closed_at', dateRange.endDate)
    .not('closed_at', 'is', null);

  if (error) throw error;

  const total = deals?.reduce((sum, deal) => sum + ((deal as any).value || 0), 0) || 0;

  // Agrupar por mês
  const monthlyData = new Map<string, number>();
  deals?.forEach((deal: unknown) => {
    if (!deal.closed_at) return;

    const month = formatMonthKey(new Date(deal.closed_at));
    monthlyData.set(month, (monthlyData.get(month) || 0) + (deal.value || 0));
  });

  const data = Array.from(monthlyData.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { total, data };
}

export async function fetchExpectedRevenue(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<{ total: number; data: RevenueDataPoint[] }> {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('value, probability, expected_close_date')
    .eq('user_id', userId)
    .in('stage', ['qualified', 'proposal', 'negotiation'])
    .gte('expected_close_date', dateRange.startDate)
    .lte('expected_close_date', dateRange.endDate)
    .not('expected_close_date', 'is', null);

  if (error) throw error;

  const monthlyData = new Map<string, number>();
  let total = 0;

  deals?.forEach((deal: unknown) => {
    if (!deal.expected_close_date) return;

    const expectedValue = (deal.value || 0) * ((deal.probability || 0) / 100);
    total += expectedValue;

    const month = formatMonthKey(new Date(deal.expected_close_date));
    monthlyData.set(month, (monthlyData.get(month) || 0) + expectedValue);
  });

  const data = Array.from(monthlyData.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { total, data };
}

export async function buildRevenueData(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<RevenueData> {
  const [realized, expected] = await Promise.all([
    fetchRealizedRevenue(supabase, userId, dateRange),
    fetchExpectedRevenue(supabase, userId, dateRange),
  ]);

  // Buscar período anterior para comparação
  const previousPeriod = calculatePreviousPeriod(dateRange);
  const previousRealized = await fetchRealizedRevenue(supabase, userId, previousPeriod);

  const percentChange = calculatePercentChange(realized.total, previousRealized.total);

  return {
    realized,
    expected,
    comparison: {
      previousPeriodTotal: previousRealized.total,
      percentChange,
      trend: calculateTrend(realized.total, previousRealized.total),
    },
  };
}

// ============================================
// Pipeline Distribution
// ============================================

export async function buildPipelineDistribution(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PipelineDistributionData> {
  // Buscar todos os stages
  const { data: stages } = await supabase
    .from('deal_stages')
    .select('*')
    .order('position', { ascending: true });

  // Buscar deals ativos
  const { data: deals, error } = await supabase
    .from('deals')
    .select('value, stage')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;

  const stageMap = new Map<string, { value: number; count: number }>();
  let totalValue = 0;
  let totalCount = 0;

  deals?.forEach((deal: unknown) => {
    const stage = stageMap.get(deal.stage) || { value: 0, count: 0 };
    stage.value += deal.value || 0;
    stage.count += 1;
    stageMap.set(deal.stage, stage);

    totalValue += deal.value || 0;
    totalCount += 1;
  });

  const byValue: PipelineStageDistribution[] =
    stages?.map((stage: unknown) => {
      const data = stageMap.get(stage.id) || { value: 0, count: 0 };
      return {
        stage: stage.id,
        stageName: stage.name,
        value: data.value,
        count: data.count,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        color: stage.color,
      };
    }) || [];

  const byCount: PipelineStageDistribution[] =
    stages?.map((stage: unknown) => {
      const data = stageMap.get(stage.id) || { value: 0, count: 0 };
      return {
        stage: stage.id,
        stageName: stage.name,
        value: data.value,
        count: data.count,
        percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
        color: stage.color,
      };
    }) || [];

  return {
    byValue,
    byCount,
    total: {
      value: totalValue,
      count: totalCount,
    },
  };
}

// ============================================
// Performance Metrics
// ============================================

export async function calculateWinRate(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<number> {
  const { count: totalDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', dateRange.startDate)
    .lte('created_at', dateRange.endDate);

  const { count: wonDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'won')
    .gte('closed_at', dateRange.startDate)
    .lte('closed_at', dateRange.endDate);

  if (!totalDeals || totalDeals === 0) return 0;
  return Math.round(((wonDeals || 0) / totalDeals) * 100);
}

export async function calculateAverageTicket(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<number> {
  const { data: deals } = await supabase
    .from('deals')
    .select('value')
    .eq('user_id', userId)
    .eq('status', 'won')
    .gte('closed_at', dateRange.startDate)
    .lte('closed_at', dateRange.endDate);

  if (!deals || deals.length === 0) return 0;

  const total = deals.reduce((sum, deal) => sum + ((deal as any).value || 0), 0);
  return Math.round(total / deals.length);
}

export async function calculateSalesCycle(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<number> {
  const { data: deals } = await supabase
    .from('deals')
    .select('created_at, closed_at')
    .eq('user_id', userId)
    .eq('status', 'won')
    .gte('closed_at', dateRange.startDate)
    .lte('closed_at', dateRange.endDate)
    .not('closed_at', 'is', null);

  if (!deals || deals.length === 0) return 0;

  const cycles = deals.map((deal: unknown) => {
    const created = new Date(deal.created_at);
    const closed = new Date(deal.closed_at!);
    return Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  });

  const avg = cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length;
  return Math.round(avg);
}

export async function buildPerformanceMetrics(
  supabase: SupabaseClient<Database>,
  userId: string,
  dateRange: DateRange
): Promise<PerformanceMetrics> {
  const previousPeriod = calculatePreviousPeriod(dateRange);

  const [
    currentWinRate,
    previousWinRate,
    currentTicket,
    previousTicket,
    currentCycle,
    previousCycle,
  ] = await Promise.all([
    calculateWinRate(supabase, userId, dateRange),
    calculateWinRate(supabase, userId, previousPeriod),
    calculateAverageTicket(supabase, userId, dateRange),
    calculateAverageTicket(supabase, userId, previousPeriod),
    calculateSalesCycle(supabase, userId, dateRange),
    calculateSalesCycle(supabase, userId, previousPeriod),
  ]);

  return {
    winRate: {
      current: currentWinRate,
      previous: previousWinRate,
      change: calculatePercentChange(currentWinRate, previousWinRate),
      trend: calculateTrend(currentWinRate, previousWinRate),
    },
    averageTicket: {
      current: currentTicket,
      previous: previousTicket,
      change: calculatePercentChange(currentTicket, previousTicket),
      trend: calculateTrend(currentTicket, previousTicket),
    },
    salesCycle: {
      current: currentCycle,
      previous: previousCycle,
      change: calculatePercentChange(currentCycle, previousCycle),
      trend: calculateTrend(currentCycle, previousCycle),
    },
    conversionRate: {
      leadToCustomer: currentWinRate,
      stageByStage: [], // TODO: Implementar análise estágio por estágio
    },
  };
}

// ============================================
// Forecast
// ============================================

export async function buildForecast(
  supabase: SupabaseClient<Database>,
  userId: string,
  months: number = 3
): Promise<ForecastData> {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + months);

  const { data: deals } = await supabase
    .from('deals')
    .select('value, probability, expected_close_date')
    .eq('user_id', userId)
    .in('stage', ['qualified', 'proposal', 'negotiation'])
    .lte('expected_close_date', futureDate.toISOString())
    .not('expected_close_date', 'is', null);

  const monthlyForecast = new Map<string, number>();
  let totalValue = 0;
  const count = deals?.length || 0;

  deals?.forEach((deal: unknown) => {
    if (!deal.expected_close_date) return;

    const expectedValue = (deal.value || 0) * ((deal.probability || 0) / 100);
    totalValue += expectedValue;

    const month = formatMonthKey(new Date(deal.expected_close_date));
    monthlyForecast.set(month, (monthlyForecast.get(month) || 0) + expectedValue);
  });

  const forecast: ForecastDataPoint[] = Array.from(monthlyForecast.entries())
    .map(([month, realistic]) => ({
      month,
      pessimistic: Math.round(realistic * 0.5),
      realistic: Math.round(realistic),
      optimistic: Math.round(realistic * 1.5),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calcular confidence baseado em histórico
  const averageCloseRate = await calculateWinRate(
    supabase,
    userId,
    calculateDateRange('90d')
  );

  return {
    forecast,
    confidence: Math.min(averageCloseRate, 100),
    basis: {
      dealsInPipeline: count,
      totalValue,
      averageCloseRate,
    },
  };
}

// ============================================
// Trends
// ============================================

export async function buildTrendsData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<TrendsData> {
  // Buscar últimos 12 meses
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const { data: deals } = await supabase
    .from('deals')
    .select('value, closed_at')
    .eq('user_id', userId)
    .eq('status', 'won')
    .gte('closed_at', startDate.toISOString())
    .lte('closed_at', endDate.toISOString())
    .not('closed_at', 'is', null);

  const monthlyData = new Map<string, { revenue: number; deals: number }>();

  deals?.forEach((deal: unknown) => {
    if (!deal.closed_at) return;

    const month = formatMonthKey(new Date(deal.closed_at));
    const data = monthlyData.get(month) || { revenue: 0, deals: 0 };
    data.revenue += deal.value || 0;
    data.deals += 1;
    monthlyData.set(month, data);
  });

  const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const monthOverMonth: MonthlyTrend[] = sortedMonths.map(([month, data], index) => {
    const previous = index > 0 ? sortedMonths[index - 1][1] : { revenue: 0, deals: 0 };

    return {
      month,
      revenue: data.revenue,
      deals: data.deals,
      growth: {
        revenue: calculatePercentChange(data.revenue, previous.revenue),
        deals: calculatePercentChange(data.deals, previous.deals),
      },
    };
  });

  // Calcular year over year (simplificado)
  const currentYear = new Date().getFullYear();
  const currentYearRevenue =
    deals
      ?.filter((d: unknown) => new Date(d.closed_at!).getFullYear() === currentYear)
      .reduce((sum: number, d: unknown) => sum + (d.value || 0), 0) || 0;

  return {
    monthOverMonth,
    yearOverYear: {
      currentYear: currentYearRevenue,
      previousYear: 0, // TODO: Implementar quando tiver dados históricos
      growth: 0,
    },
    seasonality: {
      bestMonth: sortedMonths[0]?.[0] || '',
      worstMonth: sortedMonths[sortedMonths.length - 1]?.[0] || '',
      average: monthOverMonth.reduce((sum, m) => sum + m.revenue, 0) / monthOverMonth.length || 0,
    },
  };
}
