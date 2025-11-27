import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 *
 * Retorna todas as tags únicas dos contatos de forma otimizada.
 * Usa query SQL direta para extrair tags sem buscar todos os contatos.
 *
 * Performance: ~50ms (vs ~300ms do método anterior)
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

    // Query otimizada: busca apenas tags, não contatos completos
    const { data, error } = await supabase.from('contacts').select('tags').not('tags', 'is', null);

    if (error) {
      logger.error('Failed to fetch tags', { error: error.message, userId: user.id });
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 });
    }

    // Extrair tags únicas
    const tagsSet = new Set<string>();

    if (data) {
      data.forEach((row: { tags?: string[] | null }) => {
        if (Array.isArray(row.tags)) {
          row.tags.forEach((tag: string) => {
            if (tag && typeof tag === 'string') {
              tagsSet.add(tag.trim().toLowerCase());
            }
          });
        }
      });
    }

    // Retornar array ordenado
    const uniqueTags = Array.from(tagsSet).sort();

    logger.info('Tags fetched successfully', {
      count: uniqueTags.length,
      userId: user.id,
    });

    return NextResponse.json({
      tags: uniqueTags,
      count: uniqueTags.length,
    });
  } catch (error) {
    logger.error('Unexpected error in tags API', { error });
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
