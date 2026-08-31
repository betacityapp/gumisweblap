'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Tag } from 'lucide-react';
import { getAllPriceItems, upsertPriceItem, deletePriceItem } from '@/lib/db';
import type { PriceItem } from '@/lib/types';

export default function AdminPricesPage() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PriceItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', label: '', price_from: '', price_to: '', unit: '', note: '', sort_order: 0, is_active: true });

  const load = async () => {
    const data = await getAllPriceItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.category || !form.label) return;
    await upsertPriceItem({
      ...(editing ? { id: editing.id } : {}),
      category: form.category,
      label: form.label,
      price_from: form.price_from ? parseInt(form.price_from) : null,
      price_to: form.price_to ? parseInt(form.price_to) : null,
      unit: form.unit || '',
      note: form.note || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ category: '', label: '', price_from: '', price_to: '', unit: '', note: '', sort_order: 0, is_active: true });
    await load();
  };

  const handleEdit = (item: PriceItem) => {
    setEditing(item);
    setForm({ category: item.category, label: item.label, price_from: item.price_from != null ? String(item.price_from) : '', price_to: item.price_to != null ? String(item.price_to) : '', unit: item.unit ?? '', note: item.note ?? '', sort_order: item.sort_order, is_active: item.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt az árat?')) return;
    await deletePriceItem(id);
    await load();
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Árlista</h1>
          <p className="text-slate-500 mt-1">Árlista tételek kezelése</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ category: '', label: '', price_from: '', price_to: '', unit: '', note: '', sort_order: 0, is_active: true }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Új ár
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editing ? 'Ár szerkesztése' : 'Új ár'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategória *</label>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Gumicsere" list="price-categories" />
              <datalist id="price-categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Megnevezés *</label>
              <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Személyautó 15-16 col" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ár -tól (Ft)</label>
              <input type="text" value={form.price_from} onChange={e => setForm({ ...form, price_from: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ár -ig (Ft)</label>
              <input type="text" value={form.price_to} onChange={e => setForm({ ...form, price_to: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="8000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Egység</label>
              <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="db / készlet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Megjegyzés</label>
              <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Ingyenszerelés 4 gumi vásárlása esetén" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded" />
                Aktív
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              <Save className="w-4 h-4" /> Mentés
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-500 hover:text-slate-700 text-sm">Mégse</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Nincs árlista tétel</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{cat}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {items.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{item.label}</span>
                        {!item.is_active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Rejtett</span>}
                      </div>
                      {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-700">
                        {item.price_from ? `${item.price_from} Ft` : ''}
                        {item.price_from && item.price_to ? ' – ' : ''}
                        {item.price_to ? `${item.price_to} Ft` : ''}
                        {item.unit ? ` / ${item.unit}` : ''}
                      </span>
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
