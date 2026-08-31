'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { AnnouncementBanner } from '@/lib/types';

export default function AnnouncementBannerDisplay() {
  const [banners, setBanners] = useState<AnnouncementBanner[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/track?action=banners').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setBanners(data);
    }).catch(() => {});
  }, []);

  const visible = banners.filter(b => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes banner-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes banner-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes banner-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .banner-scroll { animation: banner-scroll 20s linear infinite; white-space: nowrap; }
        .banner-bounce { animation: banner-bounce 1s ease-in-out infinite; }
        .banner-pulse { animation: banner-pulse 2s ease-in-out infinite; }
      `}</style>
      <div className="relative z-50">
        {visible.map(b => {
          const inner = (
            <span className="inline-flex items-center gap-2">
              {b.text}
              {b.link_url && <ExternalLink className="w-3.5 h-3.5 opacity-80" />}
            </span>
          );
          const animClass = b.animation === 'scroll' ? 'banner-scroll' : b.animation === 'bounce' ? 'banner-bounce' : b.animation === 'pulse' ? 'banner-pulse' : '';
          return (
            <div key={b.id} className="relative flex items-center" style={{ backgroundColor: b.bg_color, color: b.text_color }}>
              <div className="flex-1 overflow-hidden py-2.5 px-4">
                {b.link_url ? (
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer" className={`block text-sm font-semibold ${animClass}`}>
                    {inner}
                  </a>
                ) : (
                  <div className={`block text-sm font-semibold text-center ${animClass}`}>
                    {inner}
                  </div>
                )}
              </div>
              <button
                onClick={() => { const n = new Set(dismissed); n.add(b.id); setDismissed(n); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Bezárás"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
