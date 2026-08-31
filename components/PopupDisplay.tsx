'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, BarChart3 } from 'lucide-react';
import { getActivePopups } from '@/lib/db';
import type { Popup } from '@/lib/types';

export default function PopupDisplay() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [currentPopup, setCurrentPopup] = useState<Popup | null>(null);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    getActivePopups().then(data => {
      if (data.length === 0) return;
      setPopups(data);
      const freq = data[0].display_frequency;
      const storageKey = `popup_${data[0].id}_dismissed`;
      if (freq === 'once' && localStorage.getItem(storageKey)) return;
      if (freq === 'session' && sessionStorage.getItem(storageKey)) return;
      setCurrentPopup(data[0]);
      setPollVotes(data[0].poll_votes ?? {});
      setHasVoted(!!localStorage.getItem(`poll_${data[0].id}_voted`));
    });
  }, []);

  const dismiss = () => {
    if (!currentPopup) return;
    const storageKey = `popup_${currentPopup.id}_dismissed`;
    if (currentPopup.display_frequency === 'once') localStorage.setItem(storageKey, '1');
    else if (currentPopup.display_frequency === 'session') sessionStorage.setItem(storageKey, '1');
    setCurrentPopup(null);
  };

  const vote = (option: string) => {
    if (hasVoted || !currentPopup) return;
    const updated = { ...pollVotes, [option]: (pollVotes[option] ?? 0) + 1 };
    setPollVotes(updated);
    setHasVoted(true);
    localStorage.setItem(`poll_${currentPopup.id}_voted`, '1');
    // Save vote to DB via API
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/poll/${currentPopup.id}/${option}`, sessionId: 'poll', userAgent: navigator.userAgent }),
    }).catch(() => {});
  };

  if (!currentPopup) return null;

  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={dismiss}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={dismiss} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {currentPopup.image_url && (
          <div className="relative w-full h-48 overflow-hidden">
            <img src={currentPopup.image_url} alt={currentPopup.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          <h3 className="font-black text-xl text-slate-900 mb-2">{currentPopup.title}</h3>

          {currentPopup.content_html && (
            <div className="text-sm text-slate-600 mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentPopup.content_html }} />
          )}

          {currentPopup.type === 'poll' && currentPopup.poll_question && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <p className="font-semibold text-slate-800 text-sm">{currentPopup.poll_question}</p>
              </div>
              <div className="space-y-2">
                {(currentPopup.poll_options ?? []).map((opt, i) => {
                  const votes = pollVotes[opt] ?? 0;
                  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                  return (
                    <button key={i} onClick={() => vote(opt)} disabled={hasVoted}
                      className="w-full text-left relative overflow-hidden rounded-xl border border-slate-200 hover:border-purple-300 transition-colors group">
                      {hasVoted && (
                        <div className="absolute inset-0 bg-purple-50" style={{ width: `${pct}%` }} />
                      )}
                      <div className="relative flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm font-medium text-slate-700">{opt}</span>
                        {hasVoted && <span className="text-xs font-bold text-purple-600">{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasVoted && <p className="text-xs text-slate-400 mt-2">Köszönjük a szavazatot! Összes szavazat: {totalVotes}</p>}
            </div>
          )}

          {currentPopup.link_url && (
            <a href={currentPopup.link_url} target="_blank" rel="noopener noreferrer" onClick={dismiss}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              {currentPopup.button_text || 'Tovább'} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {!currentPopup.link_url && currentPopup.button_text && (
            <button onClick={dismiss} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              {currentPopup.button_text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
