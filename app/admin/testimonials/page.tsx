'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Star, Edit2, Save, X } from 'lucide-react';
import { getAllTestimonials, upsertTestimonial, deleteTestimonial } from '@/lib/db';
import type { Testimonial } from '@/lib/types';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', text: '', rating: 5, date: '', is_active: true, sort_order: 0 });

  const load = async () => {
    const data = await getAllTestimonials();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.text) return;
    await upsertTestimonial({
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      text: form.text,
      rating: form.rating,
      date: form.date || new Date().toISOString(),
      is_active: form.is_active,
      sort_order: form.sort_order,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ name: '', text: '', rating: 5, date: '', is_active: true, sort_order: 0 });
    await load();
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setForm({ name: item.name, text: item.text, rating: item.rating, date: item.date ?? '', is_active: item.is_active, sort_order: item.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt az értékelést?')) return;
    await deleteTestimonial(id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Értékelések</h1>
          <p className="text-slate-500 mt-1">Ügyfél értékelések kezelése</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ name: '', text: '', rating: 5, date: '', is_active: true, sort_order: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Új értékelés
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editing ? 'Értékelés szerkesztése' : 'Új értékelés'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Név *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Kovács János" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Csillagok</label>
              <div className="flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`w-6 h-6 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Szöveg *</label>
              <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Az ügyfél véleménye..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dátum</label>
              <input type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="2024-01-15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded" />
                Aktív (megjelenik a weboldalon)
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
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Nincs értékelés</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
              <div className="flex shrink-0 gap-0.5 pt-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                  {!item.is_active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Rejtett</span>}
                </div>
                <p className="text-sm text-slate-600 mt-1">{item.text}</p>
                <p className="text-xs text-slate-400 mt-1">{item.date}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
