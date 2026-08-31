'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import BlogEditor from '@/components/admin/BlogEditor';
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/db';
import type { BlogPost } from '@/lib/types';

interface Props {
  params: { id: string };
}

export default function EditBlogPostPage({ params }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<Partial<BlogPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBlogPostById(params.id).then((p) => {
      setPost(p);
      setLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    await updateBlogPost(params.id, post);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!post || !confirm(`Biztosan törli a(z) "${post.title}" bejegyzést?`)) return;
    await deleteBlogPost(params.id);
    router.push('/admin/blog');
  };

  if (loading) return <div className="text-slate-400">Betöltés...</div>;
  if (!post) return <div className="text-slate-400">A bejegyzés nem található.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{post.title || 'Bejegyzés szerkesztése'}</h1>
            <p className="text-slate-500 mt-0.5 text-sm">/{post.lang || 'hu'}/blog/{post.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {post.slug && (
            <a href={`/${post.lang || 'hu'}/blog/${post.slug}`} target="_blank" className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50">
              <Eye className="w-4 h-4" />
              Megtekintés
            </a>
          )}
          <button onClick={handleDelete} className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Törlés
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </div>
      <BlogEditor post={post} onChange={setPost} />
    </div>
  );
}
