'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Wrench } from 'lucide-react';
import { getAllServices, upsertService, deleteService } from '@/lib/db';
import type { Service } from '@/lib/types';

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', icon: '', badge: '', sort_order: 0, is_active: true });

  const load = async () => {
    const data = await getAllServices();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title) return;
    await upsertService({
      ...(editing ? { id: editing.id } : {}),
      title: form.title,
      description: form.description || null,
      icon: form.icon || '',
      badge: form.badge || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ title: '', description: '', icon: '', badge: '', sort_order: 0, is_active: true });
    await load();
  };

  const handleEdit = (item: Service) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description ?? '', icon: item.icon ?? '', badge: item.badge ?? '', sort_order: item.sort_order, is_active: item.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt a szolgáltatást?')) return;
    await deleteService(id);
    await load();
  };

  const ICON_OPTIONS = ['Gauge', 'Wind', 'Shield', 'Zap', 'Truck', 'Car', 'Settings', 'Snowflake', 'CircleDot', 'Phone'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Szolgáltatások</h1>
          <p className="text-slate-500 mt-1">Szolgáltatás kártyák kezelése</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ title: '', description: '', icon: '', badge: '', sort_order: 0, is_active: true }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Új szolgáltatás
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editing ? 'Szolgáltatás szerkesztése' : 'Új szolgáltatás'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cím *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Gumicsere" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ikon</label>
              <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400">
                <option value="">— Válasszon ikont —</option>
                {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Leírás</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Rövid leírás a szolgáltatásról..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jelvény (badge)</label>
              <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Népszerű" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
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
          <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Nincs szolgáltatás</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.badge && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{item.badge}</span>}
                    <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                    {!item.is_active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Rejtett</span>}
                  </div>
                  {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                  {item.icon && <p className="text-xs text-slate-400 mt-1">Ikon: {item.icon}</p>}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
