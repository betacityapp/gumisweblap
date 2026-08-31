'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import BlogEditor from '@/components/admin/BlogEditor';
import { createBlogPost } from '@/lib/db';
import type { BlogPost } from '@/lib/types';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Partial<BlogPost>>({
    slug: '',
    lang: 'hu',
    title: '',
    excerpt: '',
    content_html: '',
    featured_image: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    author: 'Toldi Mobil Gumi',
    city: null,
    story_prompt: null,
    story_image_url: null,
    is_published: true,
    published_at: new Date().toISOString(),
  });

  const handleSave = async () => {
    if (!post.title || !post.slug) {
      alert('A cím és a slug mezők kötelezők!');
      return;
    }
    setSaving(true);
    const result = await createBlogPost(post as Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>);
    setSaving(false);
    if (result) {
      router.push(`/admin/blog/${result.id}`);
    } else {
      alert('Hiba a mentés során. Ellenőrizze, hogy a slug egyedi-e!');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Új blog bejegyzés</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Töltse ki az adatokat, majd mentse a bejegyzést</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Mentés...' : 'Mentés'}
        </button>
      </div>
      <BlogEditor post={post} onChange={setPost} />
    </div>
  );
}
