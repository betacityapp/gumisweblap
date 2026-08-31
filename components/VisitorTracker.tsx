'use client';

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    const existing = sessionStorage.getItem('vsid');
    if (existing) {
      sessionIdRef.current = existing;
    } else {
      sessionIdRef.current = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('vsid', sessionIdRef.current);
    }

    const path = window.location.pathname;
    const referrer = document.referrer || null;
    const userAgent = navigator.userAgent;

    const startTime = Date.now();

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        sessionId: sessionIdRef.current,
        referrer,
        userAgent,
      }),
    }).catch(() => {});

    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', JSON.stringify({
          path,
          sessionId: sessionIdRef.current,
          duration,
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
}
