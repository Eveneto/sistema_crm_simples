/**
 * GET    /api/channels/[id]  — Detalhe de um canal
 * PUT    /api/channels/[id]  — Atualiza credenciais Meta
 * DELETE /api/channels/[id]  — Remove o canal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  meta_phone_number_id: z.string().min(1).optional(),
  meta_waba_id: z.string().optional(),
  meta_access_token: z.string().min(1).optional(),
  meta_app_secret: z.string().optional(),
  meta_verify_token: z.string().min(1).optional(),
  meta_business_name: z.string().optional(),
  meta_display_phone: z.string().optional(),
  is_connected: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('channels')
      .select('id, name, type, is_connected, meta_phone_number_id, meta_waba_id, meta_business_name, meta_display_phone, meta_verify_token, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Canal não encontrado' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/channels/[id]]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = UpdateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('channels')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, type, is_connected, meta_phone_number_id, meta_display_phone, meta_verify_token')
      .single();

    if (error || !data) return NextResponse.json({ error: 'Canal não encontrado' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[PUT /api/channels/[id]]', err);
    return NextResponse.json({ error: 'Erro ao atualizar canal' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/channels/[id]]', err);
    return NextResponse.json({ error: 'Erro ao remover canal' }, { status: 500 });
  }
}
