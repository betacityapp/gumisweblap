import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'Toldi Mobil Gumi & Klíma';
  const lang = searchParams.get('lang') ?? 'hu';

  const subtitle = lang === 'de'
    ? 'Mobiler Reifenservice · 24/7 · +36 30 582 0870'
    : lang === 'en'
    ? 'Mobile Tire Service · 24/7 · +36 30 582 0870'
    : 'Mobil Gumiszerviz · 0-24 · +36 30 582 0870';

  const truncTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const fontSize = truncTitle.length > 40 ? 52 : 62;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="50%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="8" fill="#dc2626"/>

  <!-- Logo -->
  <rect x="80" y="80" width="64" height="64" rx="16" fill="#dc2626"/>
  <text x="112" y="126" font-family="sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle">T</text>

  <!-- Logo text -->
  <text x="162" y="108" font-family="sans-serif" font-size="24" font-weight="700" fill="white">Toldi Mobil</text>
  <text x="162" y="135" font-family="sans-serif" font-size="18" font-weight="600" fill="#f87171">Gumi &amp; Klíma</text>

  <!-- Title -->
  <text x="80" y="${230 + (62 - fontSize)}" font-family="sans-serif" font-size="${fontSize}" font-weight="900" fill="white">${truncTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>

  <!-- Subtitle -->
  <text x="80" y="360" font-family="sans-serif" font-size="26" fill="#94a3b8">${subtitle}</text>

  <!-- Badges -->
  <rect x="80" y="430" width="100" height="44" rx="22" fill="#1e1b4b" stroke="#dc2626" stroke-opacity="0.4" stroke-width="1"/>
  <text x="130" y="458" font-family="sans-serif" font-size="20" font-weight="600" fill="#fca5a5" text-anchor="middle">24/7</text>

  <rect x="196" y="430" width="120" height="44" rx="22" fill="#1e1b4b" stroke="#dc2626" stroke-opacity="0.4" stroke-width="1"/>
  <text x="256" y="458" font-family="sans-serif" font-size="20" font-weight="600" fill="#fca5a5" text-anchor="middle">45 min</text>

  <rect x="332" y="430" width="140" height="44" rx="22" fill="#1e1b4b" stroke="#dc2626" stroke-opacity="0.4" stroke-width="1"/>
  <text x="402" y="458" font-family="sans-serif" font-size="20" font-weight="600" fill="#fca5a5" text-anchor="middle">10.000+</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
