import { Image as ImageIcon, Quote, Video, Link2, Award, AlertTriangle, CheckCircle, Star, MapPin, Type } from 'lucide-react';
import type { PageBlock } from '@/lib/types';

export default function BlockRenderer({ block }: { block: PageBlock }) {
  const d = block.block_data;

  switch (block.block_type) {
    case 'text': {
      const align = (d.align as string) ?? 'left';
      return (
        <div className={`max-w-4xl mx-auto px-4 py-6 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: (d.content as string) ?? '' }} />
        </div>
      );
    }
    case 'image': {
      const width = (d.width as string) ?? 'full';
      const wClass = width === 'half' ? 'max-w-2xl' : width === 'third' ? 'max-w-xl' : 'max-w-5xl';
      return (
        <div className={`${wClass} mx-auto px-4 py-6`}>
          {(d.url as string) && <img src={d.url as string} alt={(d.alt as string) ?? ''} className="w-full rounded-2xl shadow-lg" />}
          {(d.caption as string) && <p className="text-center text-sm text-slate-500 mt-3">{d.caption as string}</p>}
        </div>
      );
    }
    case 'gallery': {
      const images = Array.isArray(d.images) ? d.images as string[] : [];
      const cols = (d.columns as number) ?? 3;
      const gridCols = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className={`grid grid-cols-2 ${gridCols} gap-4`}>
            {images.map((url, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl group">
                <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'video': {
      const url = (d.url as string) ?? '';
      let embed = url;
      if (url.includes('youtube.com/watch?v=')) embed = url.replace('watch?v=', 'embed/');
      else if (url.includes('youtu.be/')) embed = url.replace('youtu.be/', 'youtube.com/embed/');
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {(d.title as string) && <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">{d.title as string}</h3>}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe src={embed} className="w-full h-full" allowFullScreen frameBorder="0" />
          </div>
        </div>
      );
    }
    case 'quote':
      return (
        <div className="max-w-3xl mx-auto px-4 py-10">
          <blockquote className="relative bg-slate-50 border-l-4 border-red-500 rounded-r-2xl p-8">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-200" />
            <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed italic">{(d.text as string) ?? ''}</p>
            {(d.author as string) && <footer className="mt-4 text-sm font-semibold text-slate-500">— {d.author as string}</footer>}
          </blockquote>
        </div>
      );
    case 'cta': {
      const style = (d.style as string) ?? 'red';
      const btnClass = style === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : style === 'light' ? 'bg-white border-2 border-slate-200 text-slate-800 hover:border-slate-300' : 'bg-red-600 hover:bg-red-700';
      return (
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <a href={(d.link as string) ?? '#'} target={((d.link as string) ?? '').startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${btnClass} text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg`}>
            <Link2 className="w-5 h-5" /> {(d.text as string) ?? 'Tovább'}
          </a>
        </div>
      );
    }
    case 'partner':
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            {(d.logo as string) && (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <img src={d.logo as string} alt={(d.name as string) ?? ''} className="max-w-full max-h-full object-contain p-2" />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900">{(d.name as string) ?? 'Partner'}</h3>
              </div>
              {(d.description as string) && <p className="text-sm text-slate-600 mb-3">{d.description as string}</p>}
              {(d.link as string) && (
                <a href={d.link as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-semibold">
                  Weboldal megtekintése <Link2 className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      );
    case 'alert':
      return (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{(d.text as string) ?? ''}</p>
          </div>
        </div>
      );
    case 'success':
      return (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{(d.text as string) ?? ''}</p>
          </div>
        </div>
      );
    case 'stats': {
      const items = Array.isArray(d.items) ? d.items as { value: string; label: string }[] : [];
      return (
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-red-600 mb-1">{item.value}</div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'map': {
      const addr = encodeURIComponent((d.address as string) ?? '');
      const zoom = (d.zoom as string) ?? '13';
      return (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
            <iframe src={`https://maps.google.com/maps?q=${addr}&z=${zoom}&output=embed`} className="w-full h-full" frameBorder="0" />
          </div>
        </div>
      );
    }
    case 'html':
      return <div className="max-w-4xl mx-auto px-4 py-6" dangerouslySetInnerHTML={{ __html: (d.code as string) ?? '' }} />;
    default:
      return null;
  }
}
