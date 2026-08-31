import { NextRequest, NextResponse } from 'next/server';

export const SUPPORTED_LANGS = ['hu', 'en', 'de'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'hu';

function getPreferredLang(request: NextRequest): Lang {
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value as Lang | undefined;
  if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) return cookieLang;

  const acceptLanguage = request.headers.get('accept-language') || '';
  for (const lang of SUPPORTED_LANGS) {
    if (acceptLanguage.toLowerCase().includes(lang)) return lang;
  }
  return DEFAULT_LANG;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function getRateLimitKey(request: NextRequest): string {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);

    // Stricter limits for AI endpoints (but not import-cars which sends many batches)
    if (pathname.startsWith('/api/ai/')) {
      const { allowed, remaining } = checkRateLimit(key, 10, 60000);
      if (!allowed) {
        const response = NextResponse.json(
          { error: 'Túl sok kérés. Kérjük várjon egy percet.' },
          { status: 429 }
        );
        response.headers.set('Retry-After', '60');
        return addSecurityHeaders(response);
      }
    } else if (pathname.startsWith('/api/import-cars')) {
      // Import sends many batch requests — allow up to 500 per minute
      const { allowed } = checkRateLimit(key, 500, 60000);
      if (!allowed) {
        const response = NextResponse.json(
          { error: 'Túl sok kérés. Kérjük várjon egy percet.' },
          { status: 429 }
        );
        response.headers.set('Retry-After', '60');
        return addSecurityHeaders(response);
      }
    } else if (pathname.startsWith('/api/contact')) {
      const { allowed } = checkRateLimit(key, 5, 60000);
      if (!allowed) {
        const response = NextResponse.json(
          { error: 'Túl sok kérés. Kérjük várjon egy percet.' },
          { status: 429 }
        );
        response.headers.set('Retry-After', '60');
        return addSecurityHeaders(response);
      }
    } else if (pathname.startsWith('/api/track')) {
      const { allowed } = checkRateLimit(key, 30, 60000);
      if (!allowed) {
        return addSecurityHeaders(NextResponse.json({ error: 'Rate limited' }, { status: 429 }));
      }
    } else if (pathname.startsWith('/api/cars')) {
      // Higher limit for car data lookups (interactive tool)
      const { allowed } = checkRateLimit(key, 200, 60000);
      if (!allowed) {
        return addSecurityHeaders(NextResponse.json({ error: 'Rate limited' }, { status: 429 }));
      }
    } else {
      // General API rate limit
      const { allowed } = checkRateLimit(key, 60, 60000);
      if (!allowed) {
        return addSecurityHeaders(NextResponse.json({ error: 'Rate limited' }, { status: 429 }));
      }
    }
  }

  // Block suspicious paths
  const suspiciousPatterns = [
    /\.env/i, /\.git/i, /\.ssh/i, /wp-admin/i, /phpmyadmin/i,
    /\.php$/i, /\.asp$/i, /\/admin\.php/i, /xmlrpc\.php/i,
    /\/\.\.\/\.\.\//i, /%2e%2e/i, /\/etc\/passwd/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(pathname)) {
      return addSecurityHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }
  }

  // API routes should never be language-redirected — pass through after rate limiting
  if (pathname.startsWith('/api/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Admin routes must be handled BEFORE language prefix check — they live at
  // /admin/* not /[lang]/admin/*. If someone visits /hu/admin/login we must
  // redirect to /admin/login, not pass it through to a non-existent route.
  const adminMatch = pathname.match(/^\/(hu|en|de)\/admin(.*)$/);
  if (adminMatch) {
    const cleanPath = `/admin${adminMatch[2] || ''}`;
    const redirectUrl = new URL(cleanPath, request.url);
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Already has a language prefix → pass through with security headers
  const hasLang = SUPPORTED_LANGS.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)
  );
  if (hasLang) {
    return addSecurityHeaders(NextResponse.next());
  }

  const lang = getPreferredLang(request);
  const redirectUrl = new URL(`/${lang}${pathname === '/' ? '' : pathname}`, request.url);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('NEXT_LOCALE', lang, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
