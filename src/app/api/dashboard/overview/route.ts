import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Tornar a route dinâmica para permitir query params
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    const supabase = await createClient();

    // Calcular data de início baseado no período
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Calcular data de início do período anterior (para comparação)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    // 1. Total de contatos
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // 2. Contatos do período anterior (para tendência)
    const { count: previousContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', startDate.toISOString());

    // 3. Conversas ativas (status 'open' ou 'in_progress')
    const { count: activeConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']);

    // 4. Conversas ativas do período anterior
    const { count: previousConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress'])
      .lt('created_at', startDate.toISOString());

    // 5. Taxa de conversão (negócios ganhos / total de negócios)
    const { count: totalDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true });

    const { count: wonDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'won');

    const conversionRate =
      totalDeals && totalDeals > 0 ? Math.round((wonDeals! / totalDeals) * 100) : 0;

    // 6. Taxa de conversão do período anterior
    const { count: previousTotalDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', startDate.toISOString());

    const { count: previousWonDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'won')
      .lt('created_at', startDate.toISOString());

    const previousConversionRate =
      previousTotalDeals && previousTotalDeals > 0
        ? Math.round((previousWonDeals! / previousTotalDeals) * 100)
        : 0;

    // 7. Novos contatos do período
    const { count: newContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // 8. Novos contatos do período anterior
    const { count: previousNewContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // 9. Total de vendas (soma de valores de negócios ganhos)
    const { data: salesData } = await supabase.from('deals').select('value').eq('status', 'won');

    const totalSales =
      salesData?.reduce((sum, deal) => {
        const dealValue = (deal as { value?: number }).value || 0;
        return sum + dealValue;
      }, 0) || 0;

    // 10. Vendas do período anterior
    const { data: previousSalesData } = await supabase
      .from('deals')
      .select('value')
      .eq('status', 'won')
      .lt('created_at', startDate.toISOString());

    const previousTotalSales =
      previousSalesData?.reduce((sum, deal) => {
        const dealValue = (deal as { value?: number }).value || 0;
        return sum + dealValue;
      }, 0) || 0;

    // Calcular tendências (% de mudança)
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const metrics = {
      totalContacts: totalContacts || 0,
      activeConversations: activeConversations || 0,
      conversionRate,
      newContacts: newContacts || 0,
      totalSales,
      trends: {
        contacts: calculateTrend(totalContacts || 0, previousContacts || 0),
        conversations: calculateTrend(activeConversations || 0, previousConversations || 0),
        conversion: conversionRate - previousConversionRate,
        newContacts: calculateTrend(newContacts || 0, previousNewContacts || 0),
        sales: calculateTrend(totalSales, previousTotalSales),
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    // Log error for debugging
    if (error instanceof Error) {
      console.error('Error fetching dashboard metrics:', error.message);
    }
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
