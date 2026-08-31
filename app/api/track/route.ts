import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const { path, sessionId, referrer, userAgent, duration } = await req.json();
    if (!path || !sessionId) {
      return NextResponse.json({ error: 'Missing path or sessionId' }, { status: 400 });
    }

    if (path.length > 500 || sessionId.length > 200) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const admin = createAdminClient();

    let deviceType = 'desktop';
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) deviceType = 'mobile';
      else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';
    }

    const sanitizedPath = path.replace(/[<>]/g, '').substring(0, 500);
    const sanitizedReferrer = referrer ? referrer.replace(/[<>]/g, '').substring(0, 500) : null;
    const sanitizedUA = userAgent ? userAgent.substring(0, 500) : null;

    await admin.from('page_views').insert({
      session_id: sessionId.substring(0, 200),
      path: sanitizedPath,
      referrer: sanitizedReferrer,
      user_agent: sanitizedUA,
      device_type: deviceType,
      duration_seconds: duration ?? null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action');
    if (action === 'settings') {
      const admin = createAdminClient();
      const { data } = await admin.from('settings').select('key,value').in('key', ['custom_cursor_enabled', 'animations_enabled', 'lottery_enabled']);
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: { key: string; value: string | null }) => { if (r.value !== null) map[r.key] = r.value; });
      return NextResponse.json(map);
    }
    if (action === 'banners') {
      const admin = createAdminClient();
      const now = new Date().toISOString();
      const { data } = await admin.from('announcement_banners')
        .select('*').eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('sort_order');
      return NextResponse.json(data ?? []);
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
