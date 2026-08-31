'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronRight, GripVertical, Edit2, Save, X } from 'lucide-react';
import { getAllNavigationItems, createNavigationItem, updateNavigationItem, deleteNavigationItem } from '@/lib/db';
import type { NavigationItem } from '@/lib/types';

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', url: '', target: '_self' });
  const [newItem, setNewItem] = useState({ label: '', url: '', parent_id: '', sort_order: 0, target: '_self' });

  const load = async () => {
    const data = await getAllNavigationItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const parentItems = items.filter((i) => !i.parent_id);
  const childItems = items.filter((i) => i.parent_id);

  const handleCreate = async () => {
    if (!newItem.label || !newItem.url) return;
    await createNavigationItem({
      label: newItem.label,
      url: newItem.url,
      parent_id: newItem.parent_id || null,
      sort_order: newItem.sort_order,
      is_active: true,
      target: newItem.target,
    });
    setNewItem({ label: '', url: '', parent_id: '', sort_order: 0, target: '_self' });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt a menüelemet?')) return;
    await deleteNavigationItem(id);
    await load();
  };

  const handleToggle = async (item: NavigationItem) => {
    await updateNavigationItem(item.id, { is_active: !item.is_active });
    await load();
  };

  const handleSortUpdate = async (id: string, sort_order: number) => {
    await updateNavigationItem(id, { sort_order });
    await load();
  };

  const startEdit = (item: NavigationItem) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, url: item.url, target: item.target || '_self' });
  };

  const saveEdit = async (id: string) => {
    await updateNavigationItem(id, { label: editForm.label, url: editForm.url, target: editForm.target });
    setEditingId(null);
    await load();
  };

  const renderEditButtons = (item: NavigationItem) => (
    <div className="flex items-center gap-1">
      {editingId === item.id ? (
        <>
          <button onClick={() => saveEdit(item.id)} className="p-1 rounded-lg text-green-600 hover:bg-green-50" title="Mentés">
            <Save className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50" title="Mégse">
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <button onClick={() => startEdit(item)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Szerkesztés">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(item.id)} className="p-1 rounded-lg text-slate-300 hover:text-red-500" title="Törlés">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );

  const renderEditFields = (item: NavigationItem) =>
    editingId === item.id ? (
      <div className="flex flex-col gap-1.5 flex-1">
        <input type="text" value={editForm.label} onChange={e => setEditForm({ ...editForm, label: e.target.value })}
          className="border border-slate-200 rounded-lg px-2 py-1 text-xs" placeholder="Felirat" />
        <input type="text" value={editForm.url} onChange={e => setEditForm({ ...editForm, url: e.target.value })}
          className="border border-slate-200 rounded-lg px-2 py-1 text-xs" placeholder="/url" />
        <select value={editForm.target} onChange={e => setEditForm({ ...editForm, target: e.target.value })}
          className="border border-slate-200 rounded-lg px-2 py-1 text-xs">
          <option value="_self">Ugyanabban az ablakban</option>
          <option value="_blank">Új ablakban</option>
        </select>
      </div>
    ) : (
      <div className="flex-1">
        <div className="font-medium text-slate-900 text-sm">{item.label}</div>
        <div className="text-slate-400 text-xs">{item.url}</div>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Navigáció szerkesztése</h1>
        <p className="text-slate-500 mt-1">Kezelje a weboldal navigációs menüjét – kattintson a ceruza ikonra a felirat és URL szerkesztéséhez</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nav items list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Jelenlegi navigáció</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Betöltés...</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {parentItems.map((parent) => (
                <div key={parent.id}>
                  <div className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50">
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    {renderEditFields(parent)}
                    <input
                      type="number"
                      value={parent.sort_order}
                      onChange={(e) => handleSortUpdate(parent.id, parseInt(e.target.value) || 0)}
                      className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                    />
                    <button
                      onClick={() => handleToggle(parent)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${parent.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {parent.is_active ? 'Aktív' : 'Rejtett'}
                    </button>
                    {renderEditButtons(parent)}
                  </div>
                  {/* Children */}
                  {childItems.filter((c) => c.parent_id === parent.id).map((child) => (
                    <div key={child.id} className="flex items-center gap-3 px-6 py-3 pl-12 bg-slate-50/50 hover:bg-slate-50">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      {renderEditFields(child)}
                      <input
                        type="number"
                        value={child.sort_order}
                        onChange={(e) => handleSortUpdate(child.id, parseInt(e.target.value) || 0)}
                        className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <button
                        onClick={() => handleToggle(child)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${child.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {child.is_active ? 'Aktív' : 'Rejtett'}
                      </button>
                      {renderEditButtons(child)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new item */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Új menüelem hozzáadása</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Felirat *</label>
              <input type="text" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="pl. Árlista" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">URL *</label>
              <input type="text" value={newItem.url} onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="pl. /arlista" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Szülő elem (opcionális)</label>
              <select value={newItem.parent_id} onChange={(e) => setNewItem({ ...newItem, parent_id: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400">
                <option value="">— Főmenü elem —</option>
                {parentItems.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Link megnyitása</label>
              <select value={newItem.target} onChange={(e) => setNewItem({ ...newItem, target: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400">
                <option value="_self">Ugyanabban az ablakban</option>
                <option value="_blank">Új ablakban</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input type="number" value={newItem.sort_order} onChange={(e) => setNewItem({ ...newItem, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <button onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
              <Plus className="w-4 h-4" /> Hozzáadás
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
