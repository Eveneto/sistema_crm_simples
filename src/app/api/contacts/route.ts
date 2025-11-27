import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair parâmetros da query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const orderBy = searchParams.get('orderBy') || 'created_at';
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';
    const tagsParam = searchParams.get('tags') || '';

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    // Aplicar busca (full-text search)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,custom_fields->>company.ilike.%${search}%`
      );
    }

    // Filtrar por tags
    if (tagsParam) {
      const tags = tagsParam.split(',').map((tag) => tag.trim());
      query = query.overlaps('tags', tags);
    }

    // Ordenação
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    query = query.range(offset, offset + limit - 1);

    // Executar query
    const { data: contacts, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar contatos', details: error.message },
        { status: 500 }
      );
    }

    // Calcular metadados de paginação
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: contacts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro inesperado na API de contatos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Parse do body
    const body = await request.json();

    // Validar dados com Zod
    const { createContactSchema } = await import('@/lib/validations/contact');
    
    const validation = createContactSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, phone, company, position, tags, notes } = validation.data;

    // Verificar duplicatas (email ou telefone)
    if (email || phone) {
      let duplicateQuery = supabase
        .from('contacts')
        .select('id, name, email, phone');

      if (email && phone) {
        duplicateQuery = duplicateQuery.or(`email.eq.${email},phone.eq.${phone}`);
      } else if (email) {
        duplicateQuery = duplicateQuery.eq('email', email);
      } else if (phone) {
        duplicateQuery = duplicateQuery.eq('phone', phone);
      }

      const { data: duplicates } = await duplicateQuery;

      if (duplicates && duplicates.length > 0) {
        const duplicate = duplicates[0] as { id: string; name: string; email: string | null; phone: string | null };
        return NextResponse.json(
          { 
            error: 'Contato já existe',
            details: {
              message: `Já existe um contato com este ${duplicate.email === email ? 'email' : 'telefone'}`,
              existingContact: {
                id: duplicate.id,
                name: duplicate.name,
              }
            }
          },
          { status: 409 }
        );
      }
    }

    // Preparar custom_fields
    const customFields: Record<string, any> = { status: 'lead' };
    if (company) customFields.company = company;
    if (position) customFields.position = position;
    if (notes) customFields.notes = notes;

    // Inserir contato
    const { data: newContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        tags: tags || [],
        custom_fields: customFields,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar contato:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar contato', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Contato criado com sucesso',
        data: newContact 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro inesperado ao criar contato:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
