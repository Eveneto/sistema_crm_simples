import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createDealSchema } from '@/lib/validations/deal'

/**
 * GET /api/deals
 * Lista negócios ou retorna visão de pipeline
 * 
 * Query params:
 * - view=pipeline: retorna dados agregados por estágio
 * - status: filtra por status
 * - stage_id: filtra por estágio
 * - contact_id: filtra por contato
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const isTest = searchParams.get('test') === 'true'
    
    // Verifica autenticação (exceto em modo teste)
    if (!isTest) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        )
      }
    }

    const view = searchParams.get('view')
    const status = searchParams.get('status')
    const stageId = searchParams.get('stage_id')
    const contactId = searchParams.get('contact_id')

    // Visão de pipeline: retorna estágios com deals agregados
    if (view === 'pipeline') {
      // Busca todos os estágios
      const { data: stages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position', { ascending: true })

      if (stagesError) {
        console.error('Error fetching stages:', stagesError)
        return NextResponse.json(
          { error: 'Erro ao buscar estágios' },
          { status: 500 }
        )
      }

      // Busca todos os deals ativos
      let dealsQuery = supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(id, name, email),
          stage:deal_stages(id, name, color)
        `)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })

      if (status) {
        dealsQuery = dealsQuery.eq('status', status)
      }
      if (contactId) {
        dealsQuery = dealsQuery.eq('contact_id', contactId)
      }

      const { data: deals, error: dealsError } = await dealsQuery

      if (dealsError) {
        console.error('Error fetching deals:', dealsError)
        return NextResponse.json(
          { error: 'Erro ao buscar negócios' },
          { status: 500 }
        )
      }

      // Agrupa deals por estágio
      const pipelineData = (stages as any[]).map((stage: any) => {
        const stageDeals = (deals as any[]).filter(
          (deal: any) => deal.stage_id === stage.id
        )
        
        const totalValue = stageDeals.reduce(
          (sum: number, deal: any) => sum + (Number(deal.value) || 0),
          0
        )

        return {
          id: stage.id,
          name: stage.name,
          color: stage.color,
          order_position: stage.order_position,
          deals: stageDeals,
          count: stageDeals.length,
          total_value: totalValue
        }
      })

      return NextResponse.json({
        stages: pipelineData,
        total_deals: deals?.length || 0
      })
    }

    // Visão lista: retorna deals com filtros
    let query = supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(id, name, email),
        stage:deal_stages(id, name, color)
      `)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (stageId) {
      query = query.eq('stage_id', stageId)
    }
    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data: deals, error } = await query

    if (error) {
      console.error('Error fetching deals:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar negócios' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      deals: deals || [],
      count: deals?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/deals:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/deals
 * Cria um novo negócio
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verifica autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Valida dados de entrada
    const validationResult = createDealSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const dealData = validationResult.data

    // Cria o negócio
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        title: dealData.title,
        value: dealData.value,
        contact_id: dealData.contact_id,
        stage_id: dealData.stage_id,
        user_id: user.id,
        status: 'active',
        expected_close_date: dealData.expected_close_date,
        description: dealData.description
      } as any)
      .select(`
        *,
        contact:contacts(id, name, email),
        stage:deal_stages(id, name, color)
      `)
      .single()

    if (error) {
      console.error('Error creating deal:', error)
      return NextResponse.json(
        { error: 'Erro ao criar negócio' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { deal },
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/deals:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
