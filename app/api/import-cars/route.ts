import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface JsonlRow {
  marka?: string;
  model?: string;
  generacio?: string;
  kivitel?: string;
  gyartas_kezdete?: string;
  gyartas_kezdete_ho?: number | null;
  gyartas_kezdete_ev?: number | null;
  gyartas_vege?: string;
  gyartas_vege_ho?: number | null;
  gyartas_vege_ev?: number | null;
  hajtaslanc?: string;
  karosszeria?: string;
  uzemanyag?: string;
  meghajtas?: string;
  akku_technologia?: string | null;
  akku_helye?: string | null;
  kormanymu?: string | null;
  szervokormany?: string | null;
  elso_futomu?: string | null;
  hatso_futomu?: string | null;
  elso_fek?: string | null;
  hatso_fek?: string | null;
  sebessegvalto?: string | null;
  hajtasrendszer_leiras?: string | null;
  ulesek_szama?: number | null;
  ajtok_szama?: number | null;
  felnimeret?: string | null;
  sulyerohoz_arany?: string | null;
  hosszusag_mm?: number | null;
  szelesseg_mm?: number | null;
  magassag_mm?: number | null;
  tengelytav_mm?: number | null;
  elso_nyomtav_mm?: number | null;
  hatso_nyomtav_mm?: number | null;
  elso_tullogas_mm?: number | null;
  hatso_tullogas_mm?: number | null;
  hasmagassag_mm?: number | null;
  sajattomeg_kg?: number | null;
  megengedett_ossztomeg_kg?: number | null;
  hasznos_teher_kg?: number | null;
  csomagter_min_l?: number | null;
  csomagter_max_l?: number | null;
  vegsebesseg_kmh?: number | null;
  gyorsulas_0_100_s?: number | null;
  nyomatek_nm?: number | null;
  teljesitmeny_hp?: number | null;
  akku_kapacitas_kwh?: number | null;
  hutokozeg_tipus?: string | null;
  hutokozeg_mennyiseg_g?: number | null;
  hutokozeg_mennyiseg_min_g?: number | null;
  hutokozeg_mennyiseg_max_g?: number | null;
  ac_kompresszor_olaj_tipus?: string | null;
  ac_kompresszor_olaj_szerviz?: string | null;
  ac_kompresszor_olaj_mennyiseg_ml?: number | null;
  hutokozeg_forras_model?: string | null;
  fogyasztas_varosi_l100km?: number | null;
  fogyasztas_orszaguti_l100km?: number | null;
  fogyasztas_vegyes_l100km?: number | null;
  energiafogyasztas_wltp_kwh100km?: number | null;
  elektromos_hatotav_wltp_km?: number | null;
  elektromos_hatotav_nedc_km?: number | null;
  hengerek_szama?: number | null;
  szelepek_per_henger?: number | null;
  loketterfogat_cm3?: number | null;
  furat_mm?: number | null;
  loket_mm?: number | null;
  surites_arany?: number | null;
  motor_szivas?: string | null;
  befecskendezes?: string | null;
  karosanyag_norma?: string | null;
  motorolaj_mennyiseg_l?: number | null;
  vontathato_fekes_kg?: number | null;
  vontathato_fek_nelkul_kg?: number | null;
  fajlagos_teljesitmeny_hp_l?: number | null;
  hutokozeg_eredeti?: string | null;
  hutokozeg_megjegyzes?: string | null;
  hutokozeg_ellenorizve?: string | null;
  gumi_meretek?: Array<{
    meret: string;
    tengely: string | null;
    xl: boolean;
    c: boolean;
    defekturo: boolean;
    motor_forras: string;
  }> | null;
  gumi_forras_generacio?: string;
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[áàâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i').replace(/[óòôöő]/g, 'o')
    .replace(/[úùûüű]/g, 'u').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTireSize(sizeStr: string): { width: number; aspectRatio: number; rimDiameter: number } | null {
  const match = sizeStr.replace(/\s/g, '').match(/^(\d{3})\/(\d{2,3})R(\d{2})$/i);
  if (!match) return null;
  return {
    width: parseInt(match[1]),
    aspectRatio: parseInt(match[2]),
    rimDiameter: parseInt(match[3]),
  };
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';
    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rows: JsonlRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    const admin = createAdminClient();

    let makesUpserted = 0;
    let modelsUpserted = 0;
    let generationsUpserted = 0;
    let variantsInserted = 0;
    let variantsUpdated = 0;
    let tireInserted = 0;
    let tireUpdated = 0;
    let acInserted = 0;
    let acUpdated = 0;
    let errors = 0;

    const makeCache = new Map<string, string>();
    const modelCache = new Map<string, string>();
    const genCache = new Map<string, string>();
    const variantCache = new Map<string, string>();

    for (const row of rows) {
      if (!row.marka) continue;
      const marka = row.marka;

      try {
        // ─── Make ───
        let makeId = makeCache.get(marka);
        if (!makeId) {
          const slug = slugify(marka);
          const { data: existing, error: selErr } = await admin
            .from('cars_makes')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          if (selErr) throw selErr;
          if (existing) {
            makeId = existing.id;
          } else {
            const { data: inserted, error: insErr } = await admin
              .from('cars_makes')
              .insert({ name: marka, slug, sort_order: 0 })
              .select('id')
              .maybeSingle();
            if (insErr) throw insErr;
            if (!inserted) throw new Error(`Márka beszúrása sikertelen: ${marka}`);
            makeId = inserted.id;
            makesUpserted++;
          }
          makeCache.set(marka, makeId!);
        }

        if (!row.model) continue;
        const modelNev = row.model;

        // ─── Model ───
        const modelKey = `${makeId}:${modelNev}`;
        let modelId = modelCache.get(modelKey);
        if (!modelId) {
          const slug = slugify(modelNev);
          const { data: existing, error: selErr } = await admin
            .from('cars_models')
            .select('id')
            .eq('make_id', makeId)
            .eq('slug', slug)
            .maybeSingle();
          if (selErr) throw selErr;
          if (existing) {
            modelId = existing.id;
          } else {
            const { data: inserted, error: insErr } = await admin
              .from('cars_models')
              .insert({ make_id: makeId, name: modelNev, slug, sort_order: 0 })
              .select('id')
              .maybeSingle();
            if (insErr) throw insErr;
            if (!inserted) throw new Error(`Modell beszúrása sikertelen: ${modelNev}`);
            modelId = inserted.id;
            modelsUpserted++;
          }
          modelCache.set(modelKey, modelId!);
        }

        if (!row.generacio) continue;
        const generacioNev = row.generacio;

        // ─── Generation ───
        const genCode = row.gumi_forras_generacio || generacioNev;
        const genKey = `${modelId}:${genCode}`;
        let genId = genCache.get(genKey);
        if (!genId) {
          const { data: existing, error: selErr } = await admin
            .from('cars_generations')
            .select('id')
            .eq('model_id', modelId)
            .eq('code', genCode)
            .maybeSingle();
          if (selErr) throw selErr;
          if (existing) {
            genId = existing.id;
            const updateData: Record<string, unknown> = {};
            if (row.gyartas_kezdete) updateData.production_start_text = row.gyartas_kezdete;
            if (row.gyartas_vege) updateData.production_end_text = row.gyartas_vege;
            if (row.gyartas_kezdete_ev) updateData.years_start = row.gyartas_kezdete_ev;
            if (row.gyartas_vege_ev) updateData.years_end = row.gyartas_vege_ev;
            if (row.gyartas_kezdete_ho) updateData.production_start_month = row.gyartas_kezdete_ho;
            if (row.gyartas_vege_ho) updateData.production_end_month = row.gyartas_vege_ho;
            if (Object.keys(updateData).length > 0) {
              await admin.from('cars_generations').update(updateData).eq('id', genId);
            }
          } else {
            const { data: inserted, error: insErr } = await admin
              .from('cars_generations')
              .insert({
                model_id: modelId,
                code: genCode,
                name: generacioNev,
                years_start: row.gyartas_kezdete_ev ?? null,
                years_end: row.gyartas_vege_ev ?? null,
                production_start_text: row.gyartas_kezdete ?? null,
                production_end_text: row.gyartas_vege ?? null,
                production_start_month: row.gyartas_kezdete_ho ?? null,
                production_end_month: row.gyartas_vege_ho ?? null,
                sort_order: 0,
              })
              .select('id')
              .maybeSingle();
            if (insErr) throw insErr;
            if (!inserted) throw new Error(`Generáció beszúrása sikertelen: ${generacioNev}`);
            genId = inserted.id;
            generationsUpserted++;
          }
          genCache.set(genKey, genId!);
        }

        if (!row.kivitel) continue;
        const kivitelNev = row.kivitel;

        // ─── Variant ───
        const variantKey = `${genId}:${kivitelNev}`;
        let variantId = variantCache.get(variantKey);

        const variantData: Record<string, unknown> = {
          generation_id: genId,
          name: kivitelNev,
          engine_code: null,
          fuel_type: row.uzemanyag || 'ismeretlen',
          power_hp: row.teljesitmeny_hp ?? null,
          kivitel: kivitelNev,
          hajtaslanc: row.hajtaslanc ?? null,
          karosszeria: row.karosszeria ?? null,
          uzemanyag: row.uzemanyag ?? null,
          meghajtas: row.meghajtas ?? null,
          akku_technologia: row.akku_technologia ?? null,
          akku_helye: row.akku_helye ?? null,
          kormanymu: row.kormanymu ?? null,
          szervokormany: row.szervokormany ?? null,
          elso_futomu: row.elso_futomu ?? null,
          hatso_futomu: row.hatso_futomu ?? null,
          elso_fek: row.elso_fek ?? null,
          hatso_fek: row.hatso_fek ?? null,
          sebessegvalto: row.sebessegvalto ?? null,
          hajtasrendszer_leiras: row.hajtasrendszer_leiras ?? null,
          ulesek_szama: row.ulesek_szama ?? null,
          ajtok_szama: row.ajtok_szama ?? null,
          felnimeret: row.felnimeret ?? null,
          sulyerohoz_arany: row.sulyerohoz_arany ?? null,
          hosszusag_mm: row.hosszusag_mm ?? null,
          szelesseg_mm: row.szelesseg_mm ?? null,
          magassag_mm: row.magassag_mm ?? null,
          tengelytav_mm: row.tengelytav_mm ?? null,
          elso_nyomtav_mm: row.elso_nyomtav_mm ?? null,
          hatso_nyomtav_mm: row.hatso_nyomtav_mm ?? null,
          elso_tullogas_mm: row.elso_tullogas_mm ?? null,
          hatso_tullogas_mm: row.hatso_tullogas_mm ?? null,
          hasmagassag_mm: row.hasmagassag_mm ?? null,
          sajattomeg_kg: row.sajattomeg_kg ?? null,
          megengedett_ossztomeg_kg: row.megengedett_ossztomeg_kg ?? null,
          hasznos_teher_kg: row.hasznos_teher_kg ?? null,
          csomagter_min_l: row.csomagter_min_l ?? null,
          csomagter_max_l: row.csomagter_max_l ?? null,
          vegsebesseg_kmh: row.vegsebesseg_kmh ?? null,
          gyorsulas_0_100_s: row.gyorsulas_0_100_s ?? null,
          nyomatek_nm: row.nyomatek_nm ?? null,
          teljesitmeny_hp: row.teljesitmeny_hp ?? null,
          akku_kapacitas_kwh: row.akku_kapacitas_kwh ?? null,
          fogyasztas_varosi_l100km: row.fogyasztas_varosi_l100km ?? null,
          fogyasztas_orszaguti_l100km: row.fogyasztas_orszaguti_l100km ?? null,
          fogyasztas_vegyes_l100km: row.fogyasztas_vegyes_l100km ?? null,
          energiafogyasztas_wltp_kwh100km: row.energiafogyasztas_wltp_kwh100km ?? null,
          elektromos_hatotav_wltp_km: row.elektromos_hatotav_wltp_km ?? null,
          elektromos_hatotav_nedc_km: row.elektromos_hatotav_nedc_km ?? null,
          hengerek_szama: row.hengerek_szama ?? null,
          szelepek_per_henger: row.szelepek_per_henger ?? null,
          loketterfogat_cm3: row.loketterfogat_cm3 ?? null,
          furat_mm: row.furat_mm ?? null,
          loket_mm: row.loket_mm ?? null,
          surites_arany: row.surites_arany ?? null,
          motor_szivas: row.motor_szivas ?? null,
          befecskendezes: row.befecskendezes ?? null,
          karosanyag_norma: row.karosanyag_norma ?? null,
          motorolaj_mennyiseg_l: row.motorolaj_mennyiseg_l ?? null,
          vontathato_fekes_kg: row.vontathato_fekes_kg ?? null,
          vontathato_fek_nelkul_kg: row.vontathato_fek_nelkul_kg ?? null,
          fajlagos_teljesitmeny_hp_l: row.fajlagos_teljesitmeny_hp_l ?? null,
          gumi_forras_generacio: row.gumi_forras_generacio ?? null,
        };

        if (!variantId) {
          const { data: existing, error: selErr } = await admin
            .from('cars_variants')
            .select('id')
            .eq('generation_id', genId)
            .eq('name', kivitelNev)
            .maybeSingle();
          if (selErr) throw selErr;

          if (existing) {
            variantId = existing.id;
            const { error: updErr } = await admin.from('cars_variants').update(variantData).eq('id', variantId);
            if (updErr) throw updErr;
            variantsUpdated++;
          } else {
            const { data: inserted, error: insErr } = await admin
              .from('cars_variants')
              .insert({ ...variantData, sort_order: 0 })
              .select('id')
              .maybeSingle();
            if (insErr) throw insErr;
            if (!inserted) throw new Error(`Variáns beszúrása sikertelen: ${kivitelNev}`);
            variantId = inserted.id;
            variantsInserted++;
          }
          variantCache.set(variantKey, variantId!);
        }

        // ─── Tire specs ───
        if (row.gumi_meretek && Array.isArray(row.gumi_meretek)) {
          for (const tire of row.gumi_meretek) {
            if (!tire.meret) continue;
            const parsed = parseTireSize(tire.meret);
            if (!parsed) continue;

            const tireData: Record<string, unknown> = {
              variant_id: variantId,
              position: tire.tengely || 'universal',
              width: parsed.width,
              aspect_ratio: parsed.aspectRatio,
              rim_diameter: parsed.rimDiameter,
              load_index: null,
              speed_index: null,
              tire_type: tire.defekturo ? 'run_flat' : (tire.c ? 'reinforced' : 'standard'),
              is_xl: tire.xl ?? false,
              is_c: tire.c ?? false,
              is_run_flat: tire.defekturo ?? false,
              motor_source: tire.motor_forras || 'Minden kivitel',
              raw_size: tire.meret,
              sort_order: 0,
            };

            const { data: existingTire, error: selErr } = await admin
              .from('tire_specs')
              .select('id')
              .eq('variant_id', variantId)
              .eq('raw_size', tire.meret)
              .eq('motor_source', tire.motor_forras || 'Minden kivitel')
              .maybeSingle();
            if (selErr) throw selErr;

            if (existingTire) {
              const { error: updErr } = await admin.from('tire_specs').update(tireData).eq('id', existingTire.id);
              if (updErr) throw updErr;
              tireUpdated++;
            } else {
              const { error: insErr } = await admin.from('tire_specs').insert(tireData);
              if (insErr) throw insErr;
              tireInserted++;
            }
          }
        }

        // ─── AC specs ───
        if (row.hutokozeg_tipus) {
          const acData: Record<string, unknown> = {
            variant_id: variantId,
            refrigerant_type: row.hutokozeg_tipus,
            refrigerant_amount_g: row.hutokozeg_mennyiseg_g ?? null,
            refrigerant_amount_min_g: row.hutokozeg_mennyiseg_min_g ?? null,
            refrigerant_amount_max_g: row.hutokozeg_mennyiseg_max_g ?? null,
            oil_type: row.ac_kompresszor_olaj_tipus ?? null,
            oil_amount_ml: row.ac_kompresszor_olaj_mennyiseg_ml ?? null,
            oil_service: row.ac_kompresszor_olaj_szerviz ?? null,
            source_model: row.hutokozeg_forras_model ?? null,
            verification_status: row.hutokozeg_ellenorizve ?? 'nincs-adat',
            original_refrigerant: row.hutokozeg_eredeti ?? null,
            ac_notes: row.hutokozeg_megjegyzes ?? null,
            needs_manual_check: row.hutokozeg_ellenorizve === 'gyanus-2014-2016',
            notes: null,
          };

          const { data: existingAc, error: selErr } = await admin
            .from('ac_specs')
            .select('id')
            .eq('variant_id', variantId)
            .maybeSingle();
          if (selErr) throw selErr;

          if (existingAc) {
            const { error: updErr } = await admin.from('ac_specs').update(acData).eq('id', existingAc.id);
            if (updErr) throw updErr;
            acUpdated++;
          } else {
            const { error: insErr } = await admin.from('ac_specs').insert(acData);
            if (insErr) throw insErr;
            acInserted++;
          }
        }
      } catch (rowErr: any) {
        errors++;
        // Continue with next row instead of crashing
        console.error(`Import error for row ${marka} ${row.model}:`, rowErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      processed: rows.length,
      errors,
      stats: {
        makesUpserted,
        modelsUpserted,
        generationsUpserted,
        variantsInserted,
        variantsUpdated,
        tireInserted,
        tireUpdated,
        acInserted,
        acUpdated,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
