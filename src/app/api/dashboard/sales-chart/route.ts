import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Deal {
  value: number;
  closed_at: string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter parâmetro de período (padrão: 30 dias)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calcular data inicial
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar deals ganhos no período
    const { data: deals, error } = await supabase
      .from('deals')
      .select('value, closed_at')
      .eq('status', 'won')
      .gte('closed_at', startDate.toISOString())
      .order('closed_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }

    // Agrupar vendas por dia
    const salesByDay: Record<string, number> = {};
    const typedDeals = deals as unknown as Deal[] | null;

    typedDeals?.forEach((deal) => {
      const date = new Date(deal.closed_at).toISOString().split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + deal.value;
    });

    // Preencher dias sem vendas com 0
    const result = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: salesByDay[dateStr] || 0,
        formattedDate: currentDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        }),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      data: result,
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
        totalSales: Object.values(salesByDay).reduce((a, b) => a + b, 0),
        dealsCount: deals?.length || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
