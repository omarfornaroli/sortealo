
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;

  console.log(`--- MIDDLEWARE RAW: ${pathname} | Cookie: ${sessionCookie ? 'Si' : 'No'} ---`);

  // 1. Proteger rutas administrativas
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      console.warn(`Middleware: Intento de acceso a ${pathname} sin cookie. Redirigiendo...`);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      console.warn(`Middleware: Sesión inválida para ${pathname}. Limpiando...`);
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // 2. Redireccionar si ya está logueado e intenta ir a login/register
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session) {
        console.log('Middleware: Usuario ya logueado en página de auth. Redirigiendo a /admin');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
