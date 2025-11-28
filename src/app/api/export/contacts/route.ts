import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/export/contacts
 * Exporta todos os contatos do usuário em formato JSON
 * O cliente converte para CSV usando papaparse
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar todos os contatos do usuário
    const { data: contacts, error } = (await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as any;

    if (error) {
      logger.error('Erro ao exportar contatos:', { error, user_id: user.id });
      return NextResponse.json({ error: 'Erro ao exportar contatos' }, { status: 500 });
    }

    // Formatar dados para exportação
    const exportData =
      contacts?.map((contact: any) => ({
        ID: contact.id,
        Nome: contact.name,
        Email: contact.email || '',
        Telefone: contact.phone || '',
        Empresa: contact.company || '',
        Cargo: contact.position || '',
        Origem: contact.source || '',
        Tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
        Notas: contact.notes || '',
        'Data de Criação': new Date(contact.created_at).toLocaleString('pt-BR'),
        'Última Atualização': new Date(contact.updated_at).toLocaleString('pt-BR'),
      })) || [];

    logger.info('Contatos exportados com sucesso', {
      user_id: user.id,
      count: exportData.length,
    });

    return NextResponse.json({
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro inesperado ao exportar contatos:', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
