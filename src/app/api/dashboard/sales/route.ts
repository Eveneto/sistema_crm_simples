import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Granularity = 'daily' | 'weekly' | 'monthly';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const granularity = (searchParams.get('granularity') || 'daily') as Granularity;

    const supabase = await createClient();

    // Calcular data de início baseado no período
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Buscar deals ganhos no período
    const { data: deals, error } = await supabase
      .from('deals')
      .select('value, created_at, closed_at')
      .eq('status', 'won')
      .gte('closed_at', startDate.toISOString())
      .order('closed_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Agregar dados por período
    const salesData = aggregateSales(deals || [], granularity, startDate);

    return NextResponse.json({
      data: salesData,
      period,
      granularity,
      total: salesData.reduce((sum, item) => sum + item.value, 0),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching sales data:', error.message);
    }
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}

interface Deal {
  value: number;
  created_at: string;
  closed_at: string;
}

interface SalesDataPoint {
  date: string;
  value: number;
  count: number;
}

function aggregateSales(
  deals: Deal[],
  granularity: Granularity,
  startDate: Date
): SalesDataPoint[] {
  const dataMap = new Map<string, { value: number; count: number }>();

  // Inicializar mapa com datas
  const currentDate = new Date(startDate);
  const now = new Date();

  while (currentDate <= now) {
    const key = formatDateKey(currentDate, granularity);
    if (!dataMap.has(key)) {
      dataMap.set(key, { value: 0, count: 0 });
    }

    // Avançar data baseado na granularidade
    if (granularity === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (granularity === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  // Agregar deals
  deals.forEach((deal) => {
    const dealDate = new Date(deal.closed_at);
    const key = formatDateKey(dealDate, granularity);

    const existing = dataMap.get(key);
    if (existing) {
      existing.value += deal.value || 0;
      existing.count += 1;
    } else {
      dataMap.set(key, { value: deal.value || 0, count: 1 });
    }
  });

  // Converter mapa para array ordenado
  return Array.from(dataMap.entries())
    .map(([date, data]) => ({
      date,
      value: data.value,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (granularity === 'daily') {
    return `${year}-${month}-${day}`;
  } else if (granularity === 'weekly') {
    // Semana ISO (segunda-feira como primeiro dia)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    return formatDateKey(weekStart, 'daily');
  } else {
    return `${year}-${month}`;
  }
}
