'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, HelpCircle } from 'lucide-react';
import { getAllFaqItems, upsertFaqItem, deleteFaqItem } from '@/lib/db';
import type { FaqItem } from '@/lib/types';

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', sort_order: 0, is_active: true });

  const load = async () => {
    const data = await getAllFaqItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.question || !form.answer) return;
    await upsertFaqItem({
      ...(editing ? { id: editing.id } : {}),
      question: form.question,
      answer: form.answer,
      sort_order: form.sort_order,
      is_active: form.is_active,
    });
    setEditing(null);
    setShowForm(false);
    setForm({ question: '', answer: '', sort_order: 0, is_active: true });
    await load();
  };

  const handleEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, sort_order: item.sort_order, is_active: item.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt a kérdést?')) return;
    await deleteFaqItem(id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">GYIK</h1>
          <p className="text-slate-500 mt-1">Gyakran ismételt kérdések kezelése</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ question: '', answer: '', sort_order: 0, is_active: true }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Új kérdés
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editing ? 'Kérdés szerkesztése' : 'Új kérdés'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kérdés *</label>
              <input type="text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="Mennyibe kerül egy gumicsere?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Válasz *</label>
              <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="A válasz..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pb-2.5">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded" />
                  Aktív
                </label>
              </div>
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
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">Nincs kérdés</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{item.question}</span>
                    {!item.is_active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Rejtett</span>}
                  </div>
                  <p className="text-sm text-slate-600">{item.answer}</p>
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
