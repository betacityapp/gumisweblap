'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageEditor from '@/components/admin/PageEditor';
import { getPageById, updatePage, deletePage, getPageCustomPrices, replacePageCustomPrices } from '@/lib/db';
import type { Page, PageCustomPrice } from '@/lib/types';

interface Props {
  params: { id: string };
}

export default function EditPagePage({ params }: Props) {
  const router = useRouter();
  const [page, setPage] = useState<Partial<Page> | null>(null);
  const [customPrices, setCustomPrices] = useState<PageCustomPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getPageById(params.id),
      getPageCustomPrices(params.id),
    ]).then(([p, prices]) => {
      setPage(p);
      setCustomPrices(prices);
      setLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await updatePage(params.id, page);
      const pricesToSave = customPrices.map((p, i) => ({
        page_id: params.id,
        category: p.category,
        label: p.label,
        price_from: p.price_from,
        price_to: p.price_to,
        unit: p.unit,
        note: p.note,
        sort_order: i,
        is_active: p.is_active,
      }));
      await replacePageCustomPrices(params.id, pricesToSave);
      toast.success('Oldal mentve');
    } catch {
      toast.error('Mentési hiba');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!page || !confirm(`Biztosan törli a(z) "${page.title}" oldalt?`)) return;
    await deletePage(params.id);
    router.push('/admin/pages');
  };

  if (loading) return <div className="text-slate-400">Betöltés...</div>;
  if (!page) return <div className="text-slate-400">Az oldal nem található.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{page.title || 'Oldal szerkesztése'}</h1>
            <p className="text-slate-500 mt-0.5 text-sm">/{page.lang || 'hu'}/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {page.slug && (
            <a
              href={`/${page.lang || 'hu'}/${page.slug}`}
              target="_blank"
              className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Megtekintés
            </a>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Törlés
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </div>

      <PageEditor
        page={page}
        onChange={setPage}
        customPrices={customPrices}
        onCustomPricesChange={setCustomPrices}
      />
    </div>
  );
}
