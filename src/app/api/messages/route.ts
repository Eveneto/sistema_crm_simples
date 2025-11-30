import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createMessageSchema } from '@/lib/validations/message';

/**
 * POST /api/messages
 * Cria uma nova mensagem em uma conversa
 * Valida que a conversa pertence ao usuário antes de inserir
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verifica autenticação
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse e valida o corpo da requisição
    const body = await request.json();
    const validated = createMessageSchema.parse(body);

    // Verificar que a conversa pertence ao usuário
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', validated.conversation_id)
      .eq('assigned_to', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Inserir nova mensagem
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: validated.conversation_id,
          sender_type: 'user',
          sender_id: user.id,
          content: validated.content,
          message_type: 'text',
          is_read: true // Mensagens do usuário começam como lidas
        } as any
      ] as any)
      .select()
      .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      throw msgError;
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'JSON inválido' },
        { status: 400 }
      );
    }

    // Validação do Zod
    if (
      error &&
      typeof error === 'object' &&
      'issues' in error
    ) {
      const zodError = error as any;
      return NextResponse.json(
        {
          error: 'Validação falhou',
          issues: zodError.issues
        },
        { status: 400 }
      );
    }

    console.error('POST /api/messages error:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}
