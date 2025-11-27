import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations/contact';

// GET /api/contacts/[id] - Buscar contato por ID
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

    const { id } = params;

    // Buscar contato
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !contact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: contact });
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contato' },
      { status: 500 }
    );
  }
}

// PATCH /api/contacts/[id] - Atualizar contato
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

    const { id } = params;
    const body = await request.json();

    // Validar dados
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, company, position, tags, notes } =
      validation.data;

    // Verificar se o contato existe
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingContact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar duplicatas (email ou telefone) - exceto o próprio contato
    if (email || phone) {
      let duplicateQuery = supabase
        .from('contacts')
        .select('id, name, email, phone')
        .neq('id', id); // Excluir o próprio contato

      if (email && phone) {
        duplicateQuery = duplicateQuery.or(`email.eq.${email},phone.eq.${phone}`);
      } else if (email) {
        duplicateQuery = duplicateQuery.eq('email', email);
      } else if (phone) {
        duplicateQuery = duplicateQuery.eq('phone', phone);
      }

      const { data: duplicates } = await duplicateQuery;

      if (duplicates && duplicates.length > 0) {
        const duplicate: any = duplicates[0];
        const duplicateField = duplicate.email === email ? 'email' : 'telefone';
        return NextResponse.json(
          {
            error: 'Contato já existe',
            details: {
              message: `Já existe um contato com este ${duplicateField}`,
              existingContact: {
                id: duplicate.id,
                name: duplicate.name,
              },
            },
          },
          { status: 409 }
        );
      }
    }

    // Atualizar contato
    const updateData: any = {
      name,
      email: email || null,
      phone: phone || null,
      tags: tags || [],
      custom_fields: {
        company: company || '',
        position: position || '',
        status: 'lead',
        notes: notes || '',
      },
      updated_at: new Date().toISOString(),
    };

    const { data: updatedContact, error: updateError } = (await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()) as any;

    if (updateError) {
      console.error('Erro ao atualizar contato:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar contato' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Contato atualizado com sucesso',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Erro ao processar atualização:', error);
    return NextResponse.json(
      { error: 'Erro ao processar atualização' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Excluir contato
export async function DELETE(
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

    const { id } = params;

    // Verificar se o contato existe
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingContact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Excluir contato
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir contato:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao excluir contato' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Contato excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao processar exclusão:', error);
    return NextResponse.json(
      { error: 'Erro ao processar exclusão' },
      { status: 500 }
    );
  }
}
