/**
 * GET  /api/channels     — Lista canais WhatsApp configurados
 * POST /api/channels     — Cria novo canal Meta WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateChannelSchema = z.object({
  name: z.string().min(1).max(100),
  meta_phone_number_id: z.string().min(1),
  meta_waba_id: z.string().optional(),
  meta_access_token: z.string().min(1),
  meta_app_secret: z.string().optional(),
  meta_verify_token: z.string().min(1),
  meta_business_name: z.string().optional(),
  meta_display_phone: z.string().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('channels')
      .select(
        'id, name, type, is_connected, meta_phone_number_id, meta_waba_id, meta_business_name, meta_display_phone, meta_verify_token, created_at, updated_at'
      )
      .eq('type', 'whatsapp')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[GET /api/channels]', err);
    return NextResponse.json({ error: 'Erro ao buscar canais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = CreateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('channels')
      .insert({ type: 'whatsapp', is_connected: true, ...parsed.data })
      .select('id, name, type, is_connected, meta_phone_number_id, meta_display_phone, meta_verify_token')
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[POST /api/channels]', err);
    return NextResponse.json({ error: 'Erro ao criar canal' }, { status: 500 });
  }
}
