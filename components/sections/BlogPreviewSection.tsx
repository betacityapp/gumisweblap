import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  posts: BlogPost[];
  dict?: Dictionary;
  lang?: string;
}

function formatDate(dateStr: string, lang = 'hu'): string {
  try {
    const locales: Record<string, string> = { hu: 'hu-HU', en: 'en-US', de: 'de-DE' };
    return new Date(dateStr).toLocaleDateString(locales[lang] ?? 'hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function BlogPreviewSection({ posts, dict, lang = 'hu' }: Props) {
  if (posts.length === 0) return null;
  const preview = posts.slice(0, 3);
  const d = dict?.blog;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Blog'}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">{d?.title ?? 'Hasznos cikkek autósoknak'}</h2>
          </div>
          <Link href={`/${lang}/blog`} className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:gap-3 transition-all text-sm">
            {d?.all_posts ?? 'Összes cikk'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {preview.map((post) => (
            <Link
              key={post.id}
              href={`/${lang}/blog/${post.slug}`}
              className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-red-100"
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`${post.featured_image}?auto=compress&cs=tinysrgb&w=640`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Tag className="w-3 h-3 text-red-400" />
                    <span className="text-red-600 text-xs font-semibold">{post.tags[0]}</span>
                  </div>
                )}
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors leading-snug">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.published_at, lang)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href={`/${lang}/blog`} className="inline-flex items-center gap-2 text-red-600 font-semibold">
            {d?.all_posts ?? 'Összes cikk'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
