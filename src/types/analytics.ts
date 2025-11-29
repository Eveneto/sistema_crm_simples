/**
 * Analytics Types
 * Tipos para o módulo de Analytics Avançado
 * 
 * Seguindo Clean Code:
 * - Nomes descritivos que revelam intenção
 * - Interfaces segregadas (Interface Segregation Principle)
 * - Tipagem forte (zero `any`)
 */

// ============================================
// Period & Date Range
// ============================================

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
}

// ============================================
// Revenue Analytics
// ============================================

export interface RevenueDataPoint {
  date: string;
  value: number;
}

export interface RevenueData {
  realized: {
    total: number;
    data: RevenueDataPoint[];
  };
  expected: {
    total: number;
    data: RevenueDataPoint[];
  };
  comparison: {
    previousPeriodTotal: number;
    percentChange: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// ============================================
// Pipeline Distribution
// ============================================

export interface PipelineStageDistribution {
  stage: string;
  stageName: string;
  value: number;
  count: number;
  percentage: number;
  color: string;
}

export interface PipelineDistributionData {
  byValue: PipelineStageDistribution[];
  byCount: PipelineStageDistribution[];
  total: {
    value: number;
    count: number;
  };
}

// ============================================
// Performance Metrics
// ============================================

export interface MetricWithTrend {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparkline?: RevenueDataPoint[];
}

export interface PerformanceMetrics {
  winRate: MetricWithTrend;
  averageTicket: MetricWithTrend;
  salesCycle: MetricWithTrend; // em dias
  conversionRate: {
    leadToCustomer: number;
    stageByStage: StageConversion[];
  };
}

export interface StageConversion {
  fromStage: string;
  toStage: string;
  rate: number;
  count: number;
}

// ============================================
// Forecast
// ============================================

export interface ForecastDataPoint {
  month: string;
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

export interface ForecastData {
  forecast: ForecastDataPoint[];
  confidence: number; // 0-100
  basis: {
    dealsInPipeline: number;
    totalValue: number;
    averageCloseRate: number;
  };
}

// ============================================
// Trends & Growth
// ============================================

export interface MonthlyTrend {
  month: string;
  revenue: number;
  deals: number;
  growth: {
    revenue: number; // percentage
    deals: number;   // percentage
  };
}

export interface TrendsData {
  monthOverMonth: MonthlyTrend[];
  yearOverYear: {
    currentYear: number;
    previousYear: number;
    growth: number;
  };
  seasonality: {
    bestMonth: string;
    worstMonth: string;
    average: number;
  };
}

// ============================================
// Leads Source
// ============================================

export interface LeadSourceData {
  source: string;
  count: number;
  value: number;
  conversionRate: number;
  percentage: number;
}

export interface LeadsSourceAnalytics {
  topSources: LeadSourceData[];
  total: {
    count: number;
    value: number;
  };
}

// ============================================
// Goals & Targets
// ============================================

export interface GoalProgress {
  name: string;
  target: number;
  current: number;
  percentage: number;
  status: 'on-track' | 'at-risk' | 'achieved' | 'missed';
  projectedValue: number;
}

export interface GoalsData {
  monthly: GoalProgress[];
  quarterly: GoalProgress[];
}

// ============================================
// Combined Analytics Response
// ============================================

export interface AnalyticsOverview {
  revenue: RevenueData;
  pipeline: PipelineDistributionData;
  performance: PerformanceMetrics;
  forecast: ForecastData;
  trends: TrendsData;
  leadsSource: LeadsSourceAnalytics;
  goals: GoalsData;
}

// ============================================
// API Query Parameters
// ============================================

export interface AnalyticsQueryParams {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  compareWithPrevious?: boolean;
}

export interface ForecastQueryParams {
  months?: number; // default: 3
}
