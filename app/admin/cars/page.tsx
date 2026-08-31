'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Car, Loader2, Save, X, Database, Wind, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CarMake, CarModel, CarGeneration, CarVariant, TireSpec, AcSpec } from '@/lib/types';
import { toast } from 'sonner';

type ActiveTab = 'makes' | 'models' | 'generations' | 'variants' | 'tire_specs' | 'ac_specs';

function Input({ label, value, onChange, type = 'text', required }: { label: string; value: string | number | null; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
        required={required}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function AdminCarsPage() {
  const [tab, setTab] = useState<ActiveTab>('makes');
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [generations, setGenerations] = useState<CarGeneration[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [tireSpecs, setTireSpecs] = useState<TireSpec[]>([]);
  const [acSpecs, setAcSpecs] = useState<AcSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter state
  const [filterMakeId, setFilterMakeId] = useState('');
  const [filterModelId, setFilterModelId] = useState('');
  const [filterGenId, setFilterGenId] = useState('');
  const [filterVariantId, setFilterVariantId] = useState('');

  // Form state
  const [form, setForm] = useState<Record<string, any>>({});

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'makes', label: 'Márkák', icon: <Car className="w-4 h-4" /> },
    { key: 'models', label: 'Modellek', icon: <Car className="w-4 h-4" /> },
    { key: 'generations', label: 'Generációk', icon: <Car className="w-4 h-4" /> },
    { key: 'variants', label: 'Változatok', icon: <Car className="w-4 h-4" /> },
    { key: 'tire_specs', label: 'Gumiméretek', icon: <Gauge className="w-4 h-4" /> },
    { key: 'ac_specs', label: 'Klíma adatok', icon: <Wind className="w-4 h-4" /> },
  ];

  useEffect(() => { loadMakes(); }, []);

  async function loadMakes() {
    setLoading(true);
    const { data } = await supabase.from('cars_makes').select('*').order('sort_order');
    setMakes(data ?? []);
    setLoading(false);
  }

  async function loadModels(makeId?: string) {
    const id = makeId ?? filterMakeId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('cars_models').select('*').eq('make_id', id).order('sort_order');
    setModels(data ?? []);
    setLoading(false);
  }

  async function loadGenerations(modelId?: string) {
    const id = modelId ?? filterModelId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('cars_generations').select('*').eq('model_id', id).order('sort_order');
    setGenerations(data ?? []);
    setLoading(false);
  }

  async function loadVariants(genId?: string) {
    const id = genId ?? filterGenId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('cars_variants').select('*').eq('generation_id', id).order('sort_order');
    setVariants(data ?? []);
    setLoading(false);
  }

  async function loadTireSpecs(variantId?: string) {
    const id = variantId ?? filterVariantId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('tire_specs').select('*').eq('variant_id', id).order('sort_order');
    setTireSpecs(data ?? []);
    setLoading(false);
  }

  async function loadAcSpecs(variantId?: string) {
    const id = variantId ?? filterVariantId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('ac_specs').select('*').eq('variant_id', id);
    setAcSpecs(data ?? []);
    setLoading(false);
  }

  async function deleteRow(table: string, id: string) {
    if (!confirm('Biztosan törli?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast.error('Törlési hiba: ' + error.message); return; }
    toast.success('Törölve');
    refreshCurrentTab();
  }

  function refreshCurrentTab() {
    if (tab === 'makes') loadMakes();
    else if (tab === 'models') loadModels();
    else if (tab === 'generations') loadGenerations();
    else if (tab === 'variants') loadVariants();
    else if (tab === 'tire_specs') loadTireSpecs();
    else if (tab === 'ac_specs') loadAcSpecs();
  }

  async function saveForm() {
    setSaving(true);
    const table = tab === 'tire_specs' ? 'tire_specs' : tab === 'ac_specs' ? 'ac_specs' : `cars_${tab.replace('s', '')}s`.replace('cars_makes', 'cars_makes').replace('cars_modelss', 'cars_models').replace('cars_generationss', 'cars_generations').replace('cars_variantss', 'cars_variants');

    const tableMap: Record<ActiveTab, string> = {
      makes: 'cars_makes',
      models: 'cars_models',
      generations: 'cars_generations',
      variants: 'cars_variants',
      tire_specs: 'tire_specs',
      ac_specs: 'ac_specs',
    };

    const payload = { ...form };
    if (payload.id) {
      const { error } = await supabase.from(tableMap[tab]).update(payload).eq('id', payload.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      delete payload.id;
      const { error } = await supabase.from(tableMap[tab]).insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success('Mentve');
    setSaving(false);
    setShowForm(false);
    setForm({});
    refreshCurrentTab();
  }

  const makeOptions = [{ value: '', label: '– Válasszon márkát –' }, ...makes.map(m => ({ value: m.id, label: m.name }))];
  const modelOptions = [{ value: '', label: '– Válasszon modellt –' }, ...models.map(m => ({ value: m.id, label: m.name }))];
  const genOptions = [{ value: '', label: '– Válasszon generációt –' }, ...generations.map(g => ({ value: g.id, label: g.name }))];
  const variantOptions = [{ value: '', label: '– Válasszon változatot –' }, ...variants.map(v => ({ value: v.id, label: v.name }))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Autó adatbázis</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gumiméret- és klímaadatok kezelése</p>
        </div>
        <button onClick={() => { setForm({}); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Új bejegyzés
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select label="Márka" value={filterMakeId} onChange={v => { setFilterMakeId(v); setFilterModelId(''); setFilterGenId(''); setFilterVariantId(''); loadModels(v); }} options={makeOptions} />
        {['models','generations','variants','tire_specs','ac_specs'].includes(tab) && (
          <Select label="Modell" value={filterModelId} onChange={v => { setFilterModelId(v); setFilterGenId(''); setFilterVariantId(''); loadGenerations(v); }} options={modelOptions} />
        )}
        {['generations','variants','tire_specs','ac_specs'].includes(tab) && (
          <Select label="Generáció" value={filterGenId} onChange={v => { setFilterGenId(v); setFilterVariantId(''); loadVariants(v); }} options={genOptions} />
        )}
        {['variants','tire_specs','ac_specs'].includes(tab) && (
          <Select label="Változat" value={filterVariantId} onChange={v => { setFilterVariantId(v); if (tab === 'tire_specs') loadTireSpecs(v); else if (tab === 'ac_specs') loadAcSpecs(v); else loadVariants(filterGenId); }} options={variantOptions} />
        )}
        <div className="flex items-end">
          <button onClick={() => { if (tab==='makes') loadMakes(); else if(tab==='models') loadModels(); else if(tab==='generations') loadGenerations(); else if(tab==='variants') loadVariants(); else if(tab==='tire_specs') loadTireSpecs(); else loadAcSpecs(); }}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            <Database className="w-4 h-4" /> Betöltés
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {tab === 'makes' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Neve</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Sorrend</th></>)}
                  {tab === 'models' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Neve</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th></>)}
                  {tab === 'generations' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Neve</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Kód</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Évjárat</th></>)}
                  {tab === 'variants' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Neve</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Motor kód</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Üzemanyag</th><th className="text-left px-4 py-3 font-semibold text-slate-600">LE</th></>)}
                  {tab === 'tire_specs' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Tengely</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Méret</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Típus</th></>)}
                  {tab === 'ac_specs' && (<><th className="text-left px-4 py-3 font-semibold text-slate-600">Hűtőközeg</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Mennyiség</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Olaj típus</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Ellenőrzés</th></>)}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tab === 'makes' && makes.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.slug}</td>
                    <td className="px-4 py-3 text-slate-500">{m.sort_order}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(m); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('cars_makes', m.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {tab === 'models' && models.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(m); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('cars_models', m.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {tab === 'generations' && generations.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">{g.code}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{g.years_start ?? ''}–{g.years_end ?? ''}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(g); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('cars_generations', g.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {tab === 'variants' && variants.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.engine_code}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.fuel_type==='dízel'?'bg-blue-100 text-blue-700':v.fuel_type==='hibrid'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{v.fuel_type}</span></td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{v.power_hp} LE</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(v); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('cars_variants', v.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {tab === 'tire_specs' && tireSpecs.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{s.position}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{s.width}/{s.aspect_ratio} R{s.rim_diameter} {s.load_index}{s.speed_index}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.tire_type==='reinforced'?'bg-blue-100 text-blue-700':s.tire_type==='run_flat'?'bg-purple-100 text-purple-700':'bg-slate-100 text-slate-700'}`}>{s.tire_type}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(s); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('tire_specs', s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {tab === 'ac_specs' && acSpecs.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><span className={`text-sm font-bold ${s.refrigerant_type==='R1234yf'?'text-green-700':'text-blue-700'}`}>{s.refrigerant_type}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.refrigerant_amount_g} g</td>
                    <td className="px-4 py-3 text-slate-600">{s.oil_type} {s.oil_amount_ml ? `(${s.oil_amount_ml} ml)` : ''}</td>
                    <td className="px-4 py-3">{s.needs_manual_check && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Ellenőrizze!</span>}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(s); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 mr-3 text-xs">Szerkeszt</button>
                      <button onClick={() => deleteRow('ac_specs', s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{form.id ? 'Szerkesztés' : 'Új bejegyzés'}</h2>
              <button onClick={() => { setShowForm(false); setForm({}); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {tab === 'makes' && (
                <>
                  <Input label="Neve" value={form.name ?? ''} onChange={v => setForm({...form, name: v})} required />
                  <Input label="Slug" value={form.slug ?? ''} onChange={v => setForm({...form, slug: v})} required />
                  <Input label="Sorrend" type="number" value={form.sort_order ?? 0} onChange={v => setForm({...form, sort_order: parseInt(v)})} />
                </>
              )}
              {tab === 'models' && (
                <>
                  <Select label="Márka" value={form.make_id ?? ''} onChange={v => setForm({...form, make_id: v})} options={makeOptions} />
                  <Input label="Neve" value={form.name ?? ''} onChange={v => setForm({...form, name: v})} required />
                  <Input label="Slug" value={form.slug ?? ''} onChange={v => setForm({...form, slug: v})} required />
                  <Input label="Sorrend" type="number" value={form.sort_order ?? 0} onChange={v => setForm({...form, sort_order: parseInt(v)})} />
                </>
              )}
              {tab === 'generations' && (
                <>
                  <Select label="Modell" value={form.model_id ?? ''} onChange={v => setForm({...form, model_id: v})} options={modelOptions} />
                  <Input label="Neve (pl. E46 (1998–2006))" value={form.name ?? ''} onChange={v => setForm({...form, name: v})} required />
                  <Input label="Kód (pl. E46)" value={form.code ?? ''} onChange={v => setForm({...form, code: v})} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Évjárat (-tól)" type="number" value={form.years_start ?? ''} onChange={v => setForm({...form, years_start: parseInt(v) || null})} />
                    <Input label="Évjárat (-ig)" type="number" value={form.years_end ?? ''} onChange={v => setForm({...form, years_end: parseInt(v) || null})} />
                  </div>
                  <Input label="Sorrend" type="number" value={form.sort_order ?? 0} onChange={v => setForm({...form, sort_order: parseInt(v)})} />
                </>
              )}
              {tab === 'variants' && (
                <>
                  <Select label="Generáció" value={form.generation_id ?? ''} onChange={v => setForm({...form, generation_id: v})} options={genOptions} />
                  <Input label="Neve (pl. 320d (2.0))" value={form.name ?? ''} onChange={v => setForm({...form, name: v})} required />
                  <Input label="Motor kód" value={form.engine_code ?? ''} onChange={v => setForm({...form, engine_code: v})} />
                  <Select label="Üzemanyag" value={form.fuel_type ?? 'benzin'} onChange={v => setForm({...form, fuel_type: v})} options={[{value:'benzin',label:'Benzin'},{value:'dízel',label:'Dízel'},{value:'hibrid',label:'Hibrid'},{value:'elektromos',label:'Elektromos'}]} />
                  <Input label="Teljesítmény (LE)" type="number" value={form.power_hp ?? ''} onChange={v => setForm({...form, power_hp: parseInt(v) || null})} />
                  <Input label="Sorrend" type="number" value={form.sort_order ?? 0} onChange={v => setForm({...form, sort_order: parseInt(v)})} />
                </>
              )}
              {tab === 'tire_specs' && (
                <>
                  <Select label="Változat" value={form.variant_id ?? ''} onChange={v => setForm({...form, variant_id: v})} options={variantOptions} />
                  <Select label="Tengely" value={form.position ?? 'universal'} onChange={v => setForm({...form, position: v})} options={[{value:'universal',label:'Első + Hátsó'},{value:'front',label:'Első'},{value:'rear',label:'Hátsó'}]} />
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Szélesség (pl. 205)" type="number" value={form.width ?? ''} onChange={v => setForm({...form, width: parseInt(v)})} required />
                    <Input label="Profil (pl. 55)" type="number" value={form.aspect_ratio ?? ''} onChange={v => setForm({...form, aspect_ratio: parseInt(v)})} required />
                    <Input label="Felni (pl. 16)" type="number" value={form.rim_diameter ?? ''} onChange={v => setForm({...form, rim_diameter: parseInt(v)})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Teherbírási index (pl. 91)" value={form.load_index ?? ''} onChange={v => setForm({...form, load_index: v})} />
                    <Input label="Sebesség index (pl. H)" value={form.speed_index ?? ''} onChange={v => setForm({...form, speed_index: v})} />
                  </div>
                  <Select label="Gumitípus" value={form.tire_type ?? 'standard'} onChange={v => setForm({...form, tire_type: v})} options={[{value:'standard',label:'Alap'},{value:'reinforced',label:'Erősített (XL/RF)'},{value:'run_flat',label:'Defektűrő (RunFlat)'}]} />
                  <Input label="Megjegyzés" value={form.notes ?? ''} onChange={v => setForm({...form, notes: v})} />
                  <Input label="Sorrend" type="number" value={form.sort_order ?? 0} onChange={v => setForm({...form, sort_order: parseInt(v)})} />
                </>
              )}
              {tab === 'ac_specs' && (
                <>
                  <Select label="Változat" value={form.variant_id ?? ''} onChange={v => setForm({...form, variant_id: v})} options={variantOptions} />
                  <Select label="Hűtőközeg típus" value={form.refrigerant_type ?? 'R134a'} onChange={v => setForm({...form, refrigerant_type: v})} options={[{value:'R134a',label:'R134a'},{value:'R1234yf',label:'R1234yf'}]} />
                  <Input label="Hűtőközeg mennyisége (gramm)" type="number" value={form.refrigerant_amount_g ?? ''} onChange={v => setForm({...form, refrigerant_amount_g: parseInt(v) || null})} />
                  <Input label="Kompresszor olaj típus" value={form.oil_type ?? ''} onChange={v => setForm({...form, oil_type: v})} />
                  <Input label="Olaj mennyisége (ml)" type="number" value={form.oil_amount_ml ?? ''} onChange={v => setForm({...form, oil_amount_ml: parseInt(v) || null})} />
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="manual" checked={!!form.needs_manual_check} onChange={e => setForm({...form, needs_manual_check: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-red-600" />
                    <label htmlFor="manual" className="text-sm font-medium text-slate-700">Manuális ellenőrzés szükséges</label>
                  </div>
                  <Input label="Megjegyzés" value={form.notes ?? ''} onChange={v => setForm({...form, notes: v})} />
                </>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium">Mégse</button>
              <button onClick={saveForm} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
