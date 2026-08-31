'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import BlockEditor from '@/components/admin/BlockEditor';
import { getAllPageBlocks, createPageBlock, updatePageBlock, deletePageBlock } from '@/lib/db';
import type { PageBlock } from '@/lib/types';

const BUILT_IN_PAGES: Record<string, { title: string; lang: string }> = {
  'szezonalis-gumicsere': { title: 'Szezonális Gumicsere', lang: 'hu' },
  'defektjavitas': { title: 'Defektjavítás', lang: 'hu' },
  'autoklima-toltes': { title: 'Autóklíma Töltés', lang: 'hu' },
  'centirozas': { title: 'Centrírozás', lang: 'hu' },
  'automentes': { title: 'Autómentés', lang: 'hu' },
  'flottakezeles': { title: 'Flottakezelés', lang: 'hu' },
};

interface Props {
  params: { slug: string };
}

export default function EditBuiltInPagePage({ params }: Props) {
  const pageInfo = BUILT_IN_PAGES[params.slug];
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pageInfo) { setLoading(false); return; }
    getAllPageBlocks('page', params.slug).then((data) => {
      setBlocks(data);
      setLoading(false);
    });
  }, [params.slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = blocks.filter((b) => !b.id.startsWith('new-'));
      const newBlocks = blocks.filter((b) => b.id.startsWith('new-'));

      for (const block of existing) {
        await updatePageBlock(block.id, {
          block_data: block.block_data,
          sort_order: block.sort_order,
          is_active: block.is_active,
        });
      }

      for (const block of newBlocks) {
        await createPageBlock({
          parent_type: 'page',
          parent_id: params.slug,
          block_type: block.block_type,
          block_data: block.block_data,
          sort_order: block.sort_order,
          is_active: true,
        });
      }

      const currentIds = new Set(blocks.filter((b) => !b.id.startsWith('new-')).map((b) => b.id));
      for (const old of blocks.filter((b) => !b.id.startsWith('new-') && !currentIds.has(b.id))) {
        await deletePageBlock(old.id);
      }

      toast.success('Tartalmi blokkok mentve');
      const refreshed = await getAllPageBlocks('page', params.slug);
      setBlocks(refreshed);
    } catch {
      toast.error('Mentési hiba');
    } finally {
      setSaving(false);
    }
  };

  if (!pageInfo) {
    return (
      <div>
        <Link href="/admin/pages" className="text-slate-400 hover:text-slate-600">Vissza az oldalakhoz</Link>
        <p className="text-slate-400 mt-4">Ez a beépített oldal nem szerkeszthető.</p>
      </div>
    );
  }

  if (loading) return <div className="text-slate-400">Betöltés...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{pageInfo.title}</h1>
            <p className="text-slate-500 mt-0.5 text-sm">/{pageInfo.lang}/{params.slug} — beépített oldal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${pageInfo.lang}/${params.slug}`}
            target="_blank"
            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Megtekintés
          </a>
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        Ez egy beépített oldal. A fő tartalom (hero, bevezető, előnyök, folyamat) kódból van generálva és nem módosítható itt.
        A lenti tartalmi blokkok viszont a meglévő tartalom alá kerülnek — ide adhatsz extra szövegeket, képeket, figyelmeztetéseket stb.
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
