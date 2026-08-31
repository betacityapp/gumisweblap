'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import PageEditor from '@/components/admin/PageEditor';
import { createPage, replacePageCustomPrices } from '@/lib/db';
import type { Page, PageCustomPrice } from '@/lib/types';

const DEFAULT_SECTIONS = ['hero', 'services', 'prices', 'faq', 'contact'];

export default function NewPagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Partial<Page>>({
    slug: '',
    lang: 'hu',
    title: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    content_html: '',
    page_sections: DEFAULT_SECTIONS,
    city: '',
    is_city_page: false,
    is_published: true,
    sort_order: 0,
    show_reviews: false,
    show_comments: false,
    layout_variant: 'default',
  });
  const [customPrices, setCustomPrices] = useState<PageCustomPrice[]>([]);

  const handleSave = async () => {
    if (!page.title || !page.slug) {
      toast.error('A cím és a slug mezők kötelezők!');
      return;
    }
    setSaving(true);
    const result = await createPage(page as Omit<Page, 'id' | 'created_at' | 'updated_at'>);
    if (result) {
      if (customPrices.length > 0) {
        await replacePageCustomPrices(result.id, customPrices.map((p, i) => ({
          page_id: result.id,
          category: p.category,
          label: p.label,
          price_from: p.price_from,
          price_to: p.price_to,
          unit: p.unit,
          note: p.note,
          sort_order: i,
          is_active: p.is_active,
        })));
      }
      router.push(`/admin/pages/${result.id}`);
    } else {
      toast.error('Hiba a mentés során. Ellenőrizze, hogy a slug egyedi-e!');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Új oldal</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Töltse ki az adatokat, majd mentse az oldalt</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Mentés...' : 'Mentés'}
        </button>
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

