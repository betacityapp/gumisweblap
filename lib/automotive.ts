import { supabase } from './supabase';
import type { CarMake, CarModel, CarGeneration, CarVariant, TireSpec, AcSpec } from './types';

export async function getMakes(): Promise<CarMake[]> {
  const { data, error } = await supabase
    .from('cars_makes')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getModels(makeId: string): Promise<CarModel[]> {
  const { data, error } = await supabase
    .from('cars_models')
    .select('*')
    .eq('make_id', makeId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getGenerations(modelId: string): Promise<CarGeneration[]> {
  const { data, error } = await supabase
    .from('cars_generations')
    .select('*')
    .eq('model_id', modelId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getVariants(generationId: string): Promise<CarVariant[]> {
  const { data, error } = await supabase
    .from('cars_variants')
    .select('*')
    .eq('generation_id', generationId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getTireSpecs(variantId: string): Promise<TireSpec[]> {
  const { data, error } = await supabase
    .from('tire_specs')
    .select('*')
    .eq('variant_id', variantId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getAcSpec(variantId: string): Promise<AcSpec | null> {
  const { data, error } = await supabase
    .from('ac_specs')
    .select('*')
    .eq('variant_id', variantId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface TireReverseResult {
  make_name: string;
  model_name: string;
  generation_name: string;
  generation_code: string;
  variant_name: string;
  position: string;
  tire_type: string;
  years_start: number | null;
  years_end: number | null;
}

export async function findCarsByTireSize(
  width: number,
  aspectRatio: number,
  rimDiameter: number
): Promise<TireReverseResult[]> {
  const { data, error } = await supabase
    .from('tire_specs')
    .select(`
      position,
      tire_type,
      variant:cars_variants(
        name,
        generation:cars_generations(
          name,
          code,
          years_start,
          years_end,
          model:cars_models(
            name,
            make:cars_makes(name)
          )
        )
      )
    `)
    .eq('width', width)
    .eq('aspect_ratio', aspectRatio)
    .eq('rim_diameter', rimDiameter);

  if (error) throw error;

  const results: TireReverseResult[] = [];
  for (const row of data ?? []) {
    const v = row.variant as any;
    const g = v?.generation as any;
    const model = g?.model as any;
    const make = model?.make as any;
    if (!make) continue;
    results.push({
      make_name: make.name,
      model_name: model.name,
      generation_name: g.name,
      generation_code: g.code,
      variant_name: v.name,
      position: row.position,
      tire_type: row.tire_type,
      years_start: g.years_start,
      years_end: g.years_end,
    });
  }
  return results;
}

export function formatTireSize(spec: TireSpec): string {
  return `${spec.width}/${spec.aspect_ratio} R${spec.rim_diameter}${spec.load_index ? ' ' + spec.load_index : ''}${spec.speed_index ? spec.speed_index : ''}`;
}
