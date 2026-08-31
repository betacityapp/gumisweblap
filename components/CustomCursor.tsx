'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [shape, setShape] = useState<'wheel' | 'car'>('wheel');
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/track?action=settings').then(r => r.json()).then(data => {
      if (data.custom_cursor_enabled === 'true') setEnabled(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        @media (max-width: 768px) { * { cursor: auto !important; } .custom-cursor { display: none !important; } }
      `}</style>
      <div ref={cursorRef} className="custom-cursor fixed pointer-events-none z-[9999] transition-transform duration-100" style={{ transform: 'translate(-50%, -50%)' }}>
        {shape === 'wheel' ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#1e293b" strokeWidth="2" fill="#1e293b" opacity="0.9" />
            <circle cx="16" cy="16" r="6" stroke="#ef4444" strokeWidth="2" fill="none" />
            <line x1="16" y1="1" x2="16" y2="10" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="16" y1="22" x2="16" y2="31" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="1" y1="16" x2="10" y2="16" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="22" y1="16" x2="31" y2="16" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 14 L2 10 L6 8 L12 4 L24 4 L30 8 L34 10 L34 14 L30 14" stroke="#1e293b" strokeWidth="1.5" fill="#1e293b" opacity="0.9" />
            <circle cx="10" cy="15" r="3" stroke="#ef4444" strokeWidth="1.5" fill="#334155" />
            <circle cx="26" cy="15" r="3" stroke="#ef4444" strokeWidth="1.5" fill="#334155" />
            <rect x="14" y="5" width="8" height="3" fill="#ef4444" opacity="0.8" />
          </svg>
        )}
      </div>
      <button
        onClick={() => setShape(s => s === 'wheel' ? 'car' : 'wheel')}
        className="fixed bottom-4 left-4 z-[9998] bg-slate-800 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
        style={{ cursor: 'pointer' }}
      >
        Kurzor: {shape === 'wheel' ? 'Kerék' : 'Autó'}
      </button>
    </>
  );
}
