import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateDealSchema } from '@/lib/validations/deal';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const dealId = params.id;

    // Verificar se o deal existe e pertence ao usuário
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('id, user_id')
      .eq('id', dealId)
      .single();

    if (fetchError || !existingDeal) {
      return NextResponse.json(
        { error: 'Negócio não encontrado' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((existingDeal as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Validar dados de entrada
    const body = await request.json();
    const validationResult = updateDealSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Atualizar negócio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: deal, error } = await supabase
      .from('deals')
      .update(updateData as any)
      .eq('id', dealId)
      .select(`
        *,
        contact:contacts(id, name, email),
        stage:deal_stages(id, name, color)
      `)
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar negócio' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deal });

  } catch (error) {
    console.error('PATCH /api/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const dealId = params.id;

    // Buscar negócio com detalhes
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(id, name, email, phone),
        stage:deal_stages(id, name, color)
      `)
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (error || !deal) {
      return NextResponse.json(
        { error: 'Negócio não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deal });

  } catch (error) {
    console.error('GET /api/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
