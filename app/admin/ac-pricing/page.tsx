'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Edit2, X, Snowflake, Euro } from 'lucide-react';
import { getAcPricingSettings, updateAcPricingSettings, getAcExtraServices, upsertAcExtraService, deleteAcExtraService } from '@/lib/db';
import type { AcPricingSettings, AcExtraService } from '@/lib/types';

export default function AdminAcPricingPage() {
  const [settings, setSettings] = useState<AcPricingSettings | null>(null);
  const [extras, setExtras] = useState<AcExtraService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AcExtraService | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, applies_to: 'both', is_active: true, sort_order: 0 });

  const load = async () => {
    const [s, e] = await Promise.all([getAcPricingSettings(), getAcExtraServices()]);
    setSettings(s);
    setExtras(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await updateAcPricingSettings({
      refrigerant_r134a_price_per_gram: settings.refrigerant_r134a_price_per_gram,
      refrigerant_r1234yf_price_per_gram: settings.refrigerant_r1234yf_price_per_gram,
      labor_cost_car: settings.labor_cost_car,
      labor_cost_van: settings.labor_cost_van,
      is_active: settings.is_active,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveExtra = async () => {
    if (!form.name) return;
    await upsertAcExtraService({
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      description: form.description || null,
      price: form.price,
      applies_to: form.applies_to,
      is_active: form.is_active,
      sort_order: form.sort_order,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ name: '', description: '', price: 0, applies_to: 'both', is_active: true, sort_order: 0 });
    await load();
  };

  const handleEdit = (item: AcExtraService) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description ?? '', price: item.price, applies_to: item.applies_to, is_active: item.is_active, sort_order: item.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt az extra szolgáltatást?')) return;
    await deleteAcExtraService(id);
    await load();
  };

  if (loading) return <div className="text-slate-400">Betöltés...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Klímatöltés árazás</h1>
        <p className="text-slate-500 mt-1">Árak, munkadíj és extra szolgáltatások beállítása</p>
      </div>

      {/* Pricing settings */}
      {settings && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Alapárak</h2>
              <p className="text-sm text-slate-500">Ezekkel az értékekkel számol a kalkulátor a weboldalon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">R134a gáz ára (Ft / gramm)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={settings.refrigerant_r134a_price_per_gram}
                  onChange={e => setSettings({ ...settings, refrigerant_r134a_price_per_gram: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Régebbi autók hűtőközege</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">R1234yf gáz ára (Ft / gramm)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={settings.refrigerant_r1234yf_price_per_gram}
                  onChange={e => setSettings({ ...settings, refrigerant_r1234yf_price_per_gram: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">2017+ új autók hűtőközege</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Munkadíj – Személyautó (Ft)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={settings.labor_cost_car}
                  onChange={e => setSettings({ ...settings, labor_cost_car: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Alapértelmezett a kalkulátorban</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Munkadíj – Kisteher (Ft)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" value={settings.labor_cost_van}
                  onChange={e => setSettings({ ...settings, labor_cost_van: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Választható opció a kalkulátorban</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={settings.is_active}
                onChange={e => setSettings({ ...settings, is_active: e.target.checked })}
                className="w-4 h-4 rounded" />
              Árazás aktív (megjelenik a weboldalon)
            </label>
            <button onClick={handleSaveSettings}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm ml-auto">
              <Save className="w-4 h-4" /> {saving ? 'Mentés...' : saved ? 'Mentve!' : 'Mentés'}
            </button>
          </div>
        </div>
      )}

      {/* Extra services */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900">Extra szolgáltatások</h2>
            <p className="text-sm text-slate-500">Választható kiegészítők a klímatöltés kalkulátorhoz</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: 0, applies_to: 'both', is_active: true, sort_order: 0 }); setShowForm(true); }}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> Új extra
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">{editing ? 'Extra szerkesztése' : 'Új extra szolgáltatás'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Név *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="pl. UV festék csere" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ár (Ft) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="3000" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Leírás</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Rövid leírás..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ez alkalmazható</label>
                <select value={form.applies_to} onChange={e => setForm({ ...form, applies_to: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                  <option value="both">Személyautó és kisteher</option>
                  <option value="car">Csak személyautó</option>
                  <option value="van">Csak kisteher</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded" /> Aktív
                </label>
              </div>
            </div>
            <button onClick={handleSaveExtra}
              className="mt-4 flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              <Save className="w-4 h-4" /> Mentés
            </button>
          </div>
        )}

        {extras.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Nincs extra szolgáltatás hozzáadva</p>
        ) : (
          <div className="space-y-2">
            {extras.map(extra => (
              <div key={extra.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{extra.name}</span>
                    {!extra.is_active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Rejtett</span>}
                    <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                      {extra.applies_to === 'both' ? 'Mindkettő' : extra.applies_to === 'car' ? 'Személyautó' : 'Kisteher'}
                    </span>
                  </div>
                  {extra.description && <p className="text-xs text-slate-500 mt-0.5">{extra.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 text-sm">{extra.price.toLocaleString('hu-HU')} Ft</span>
                  <button onClick={() => handleEdit(extra)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(extra.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
