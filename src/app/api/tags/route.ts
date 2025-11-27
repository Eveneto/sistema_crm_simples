import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 *
 * Retorna lista única de tags de todos os contatos
 * Otimizado com SQL function para melhor performance
 */
export async function GET() {
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

    // Buscar todos os contatos com tags
    const { data, error } = await supabase.from('contacts').select('tags').not('tags', 'is', null);

    if (error) {
      logger.error('Failed to fetch tags', {
        error: error.message,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 });
    }

    // Extrair tags únicas
    const tagsSet = new Set<string>();

    if (data) {
      (data as { tags: string[] | null }[]).forEach((contact) => {
        const tags = contact.tags;
        if (tags && Array.isArray(tags)) {
          tags.forEach((tag) => {
            if (tag && tag.trim()) {
              tagsSet.add(tag.trim().toLowerCase());
            }
          });
        }
      });
    }

    // Retornar array ordenado
    const tags = Array.from(tagsSet).sort();

    return NextResponse.json({
      tags,
      count: tags.length,
    });
  } catch (error) {
    logger.error('Unexpected error in tags API', {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: 'GET /api/tags',
    });

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
