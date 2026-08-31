import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  try {
    if (q === 'makes') {
      const { data, error } = await supabase
        .from('cars_makes')
        .select('id, name, slug')
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'models') {
      const makeId = searchParams.get('make_id');
      if (!makeId) return NextResponse.json({ error: 'make_id required' }, { status: 400 });
      const { data, error } = await supabase
        .from('cars_models')
        .select('id, name, slug')
        .eq('make_id', makeId)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'generations') {
      const modelId = searchParams.get('model_id');
      if (!modelId) return NextResponse.json({ error: 'model_id required' }, { status: 400 });
      const { data, error } = await supabase
        .from('cars_generations')
        .select('id, name, code, years_start, years_end')
        .eq('model_id', modelId)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'variants') {
      const generationId = searchParams.get('generation_id');
      if (!generationId) return NextResponse.json({ error: 'generation_id required' }, { status: 400 });
      const { data, error } = await supabase
        .from('cars_variants')
        .select('id, name, engine_code, fuel_type, power_hp, kivitel, uzemanyag, teljesitmeny_hp, karosszeria')
        .eq('generation_id', generationId)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'tire-specs') {
      const variantId = searchParams.get('variant_id');
      if (!variantId) return NextResponse.json({ error: 'variant_id required' }, { status: 400 });
      const { data, error } = await supabase
        .from('tire_specs')
        .select('*')
        .eq('variant_id', variantId)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'ac-spec') {
      const variantId = searchParams.get('variant_id');
      if (!variantId) return NextResponse.json({ error: 'variant_id required' }, { status: 400 });
      const { data, error } = await supabase
        .from('ac_specs')
        .select('*')
        .eq('variant_id', variantId)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'ac-pricing') {
      const { data, error } = await supabase
        .from('ac_pricing_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (q === 'ac-extras') {
      const { data, error } = await supabase
        .from('ac_extra_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (q === 'ai-configs') {
      const { data, error } = await supabase
        .from('ai_configs')
        .select('id, name, provider, model, is_active, is_default')
        .order('created_at');
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (q === 'pages-list') {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, city, is_city_page, is_published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (q === 'tire-shop-configs') {
      const { data, error } = await supabase
        .from('tire_shop_configs')
        .select('*')
        .eq('is_enabled', true)
        .order('sort_order');
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (q === 'tire-size-db') {
      const { data, error } = await supabase
        .from('tire_size_database')
        .select('width, aspect_ratio, rim_diameter, is_common, category');
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    if (q === 'reverse') {
      const size = searchParams.get('size') ?? '';
      const match = size.replace(/\s/g, '').match(/^(\d{3})\/(\d{2})R(\d{2})$/i);
      if (!match) return NextResponse.json({ error: 'Invalid tire size format. Use e.g. 205/55R16' }, { status: 400 });
      const [, w, ar, rd] = match;
      const { data, error } = await supabase
        .from('tire_specs')
        .select(`
          position, tire_type, is_xl, is_c, is_run_flat, raw_size, motor_source,
          variant:cars_variants(name, generation:cars_generations(name, code, years_start, years_end, model:cars_models(name, make:cars_makes(name))))
        `)
        .eq('width', parseInt(w))
        .eq('aspect_ratio', parseInt(ar))
        .eq('rim_diameter', parseInt(rd));
      if (error) throw error;
      return NextResponse.json(data ?? []);
    }

    return NextResponse.json({ error: 'Unknown query' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
