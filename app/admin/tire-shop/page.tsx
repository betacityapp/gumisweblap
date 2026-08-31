'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Edit2, X, ExternalLink, ShoppingCart } from 'lucide-react';
import { getTireShopConfigs, upsertTireShopConfig, deleteTireShopConfig } from '@/lib/db';
import type { TireShopConfig } from '@/lib/types';

export default function AdminTireShopPage() {
  const [configs, setConfigs] = useState<TireShopConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TireShopConfig | null>(null);
  const [form, setForm] = useState({ name: '', url_template: '', is_enabled: false, open_in_new_tab: true, button_label: 'Webshop', sort_order: 0 });

  const load = async () => {
    const data = await getTireShopConfigs();
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.url_template) return;
    await upsertTireShopConfig({
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      url_template: form.url_template,
      is_enabled: form.is_enabled,
      open_in_new_tab: form.open_in_new_tab,
      button_label: form.button_label,
      sort_order: form.sort_order,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ name: '', url_template: '', is_enabled: false, open_in_new_tab: true, button_label: 'Webshop', sort_order: 0 });
    await load();
  };

  const handleEdit = (item: TireShopConfig) => {
    setEditing(item);
    setForm({ name: item.name, url_template: item.url_template, is_enabled: item.is_enabled, open_in_new_tab: item.open_in_new_tab, button_label: item.button_label, sort_order: item.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt a webshop konfigurációt?')) return;
    await deleteTireShopConfig(id);
    await load();
  };

  const handleToggle = async (item: TireShopConfig) => {
    await upsertTireShopConfig({ id: item.id, name: item.name, url_template: item.url_template, is_enabled: !item.is_enabled, open_in_new_tab: item.open_in_new_tab, button_label: item.button_label, sort_order: item.sort_order });
    await load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Webshop linkek</h1>
        <p className="text-slate-500 mt-1">Gumiméret kereső – kattintható méretek webshop irányítással</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <ShoppingCart className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold">Hogyan működik?</p>
            <p className="mt-1">Ha egy konfiguráció aktív, a gumiméret kereső eredményeinél a méretek kattinthatóvá válnak. A link a megadott sablon alapján generálódik, a <code className="bg-amber-100 px-1 rounded text-xs">{'{width}'}</code>, <code className="bg-amber-100 px-1 rounded text-xs">{'{aspect_ratio}'}</code>, <code className="bg-amber-100 px-1 rounded text-xs">{'{rim}'}</code> helyőrzőket automatikusan lecseréljük a méret értékeire.</p>
            <p className="mt-1 text-xs">Példa: <code className="bg-amber-100 px-1 rounded">https://webshop.hu/gumik?w={'{width}'}&ar={'{aspect_ratio}'}&r={'{rim}'}</code></p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{configs.filter(c => c.is_enabled).length} aktív konfiguráció</p>
        <button onClick={() => { setEditing(null); setForm({ name: '', url_template: '', is_enabled: false, open_in_new_tab: true, button_label: 'Webshop', sort_order: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Új webshop link
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editing ? 'Konfiguráció szerkesztése' : 'Új webshop link'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Név *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="pl. Fő webshop" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gomb felirata</label>
              <input type="text" value={form.button_label} onChange={e => setForm({ ...form, button_label: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Webshop" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">URL sablon *</label>
              <input type="text" value={form.url_template} onChange={e => setForm({ ...form, url_template: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono" placeholder="https://webshop.hu/kereses?w={width}&ar={aspect_ratio}&r={rim}" />
              <p className="text-xs text-slate-400 mt-1">Helyőrzők: {'{width}'}, {'{aspect_ratio}'}, {'{rim}'} – pl. 205/55 R16 esetén: w=205, ar=55, r=16</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div className="flex items-end gap-4 pb-2.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.open_in_new_tab} onChange={e => setForm({ ...form, open_in_new_tab: e.target.checked })}
                  className="w-4 h-4 rounded" /> Új fülön nyíljon
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.is_enabled} onChange={e => setForm({ ...form, is_enabled: e.target.checked })}
                  className="w-4 h-4 rounded" /> Aktív
              </label>
            </div>
          </div>
          <button onClick={handleSave}
            className="mt-5 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
            <Save className="w-4 h-4" /> Mentés
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : configs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ExternalLink className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Nincs webshop konfiguráció</p>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map(config => (
            <div key={config.id} className={`bg-white rounded-2xl border p-5 ${config.is_enabled ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{config.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.is_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {config.is_enabled ? 'Aktív' : 'Inaktív'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">{config.url_template}</p>
                  <p className="text-xs text-slate-400 mt-1">Gomb: {config.button_label} · {config.open_in_new_tab ? 'Új fülön' : 'Ugyanazon a lapon'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={() => handleToggle(config)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${config.is_enabled ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {config.is_enabled ? 'Kikapcsolás' : 'Bekapcsolás'}
                  </button>
                  <button onClick={() => handleEdit(config)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(config.id)} className="p-2 rounded-lg text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
