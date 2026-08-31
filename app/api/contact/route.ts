import { NextRequest, NextResponse } from 'next/server';
import { submitContactForm } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }
    const ok = await submitContactForm(data);
    if (!ok) {
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
