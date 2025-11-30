import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/debug/stages
 * Endpoint para debugar se os stages existem no banco
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verifica autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Auth check:', { user: user?.id, authError })

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado', authError, hasUser: !!user },
        { status: 401 }
      )
    }

    // Busca todos os stages
    const { data: stages, error: stagesError } = await supabase
      .from('deal_stages')
      .select('*')
      .order('position', { ascending: true })

    console.log('Stages query result:', { stages, stagesError })

    if (stagesError) {
      console.error('Error fetching stages:', stagesError)
      return NextResponse.json(
        { error: 'Erro ao buscar stages', details: stagesError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: user.id,
      stages: stages,
      count: stages?.length || 0
    })

  } catch (error) {
    console.error('Debug stages error:', error)
    return NextResponse.json(
      { error: 'Erro interno', details: error },
      { status: 500 }
    )
  }
}