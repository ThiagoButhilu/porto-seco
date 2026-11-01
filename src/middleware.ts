import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/infra/session/sessionCookie';

const PROTECTED_ROUTES = ['/dashboard', '/endorsements', '/documents'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = request.cookies.has(SESSION_COOKIE);
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !authenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/') && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/endorsements/:path*', '/documents/:path*'],
};
