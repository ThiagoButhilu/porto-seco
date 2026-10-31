import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/infra/session/sessionCookie';

const ROTAS_PROTEGIDAS = ['/dashboard', '/averbacao', '/documentos'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const autenticado = request.cookies.has(SESSION_COOKIE);
  const protegida = ROTAS_PROTEGIDAS.some((rota) => pathname.startsWith(rota));

  if (protegida && !autenticado) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/') && autenticado) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/averbacao/:path*', '/documentos/:path*'],
};
