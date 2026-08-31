'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2, Check, CheckCheck, Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_KEY = 'toldi-admin-2024';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ContactItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  service: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AdminContactPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const admin = adminClient();
      const { data, error: dbError } = await admin
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setItems((data as ContactItem[]) || []);
      setLoading(false);
    } catch {
      setError('Nem sikerült betölteni az üzeneteket.');
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleRead = async (item: ContactItem) => {
    const admin = adminClient();
    await admin.from('contact_submissions').update({ is_read: !item.is_read }).eq('id', item.id);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törli ezt az üzenetet?')) return;
    const admin = adminClient();
    await admin.from('contact_submissions').delete().eq('id', id);
    await load();
  };

  const handleMarkAllRead = async () => {
    const admin = adminClient();
    await Promise.all(
      items.filter((i) => !i.is_read).map((i) =>
        admin.from('contact_submissions').update({ is_read: true }).eq('id', i.id)
      )
    );
    await load();
  };

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kapcsolatfelvételek</h1>
          <p className="text-slate-500 mt-1">Beérkezett üzenetek a weboldalról</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Összes olvasottnak jelölése ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Nincs beérkezett üzenet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 ${item.is_read ? 'border-slate-200' : 'border-red-300 bg-red-50/30'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!item.is_read && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.service && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{item.service}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="flex items-center gap-1 hover:text-red-600">
                        <Phone className="w-3.5 h-3.5" /> {item.phone}
                      </a>
                    )}
                    {item.email && (
                      <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-red-600">
                        <Mail className="w-3.5 h-3.5" /> {item.email}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleString('hu-HU')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mt-2">{item.message}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleRead(item)}
                    className={`p-2 rounded-lg transition-colors ${item.is_read ? 'text-slate-300 hover:text-slate-500' : 'text-green-600 hover:bg-green-50'}`}
                    title={item.is_read ? 'Olvasottnak jelölve' : 'Olvasottnak jelöl'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
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
