'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Login page is always rendered immediately, no auth check needed
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // If there's a session error or no session, clean up and redirect
        if (sessionError || !session) {
          // Clear any stale session
          if (sessionError) await supabase.auth.signOut();
          if (!cancelled) router.replace('/admin/login');
          return;
        }

        // Check if this user is in the admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (adminError || !adminData) {
          // Not an admin — sign out and redirect to login
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }

        setAuthed(true);
        setChecked(true);
      } catch {
        // On unexpected error, redirect to login page
        if (!cancelled) {
          try { await supabase.auth.signOut(); } catch {}
          router.replace('/admin/login');
        }
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !cancelled) {
        router.replace('/admin/login');
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Login page renders immediately
  if (pathname === '/admin/login') return <>{children}</>;

  // Show a loading state instead of a blank screen while checking auth
  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Betöltés...</div>
      </div>
    );
  }

  if (!authed) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
