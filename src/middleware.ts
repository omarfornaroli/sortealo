
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;

  console.log(`--- MIDDLEWARE: Validando acceso a ${pathname} ---`);

  // 1. Proteger rutas administrativas
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      console.warn('--- MIDDLEWARE: Sin cookie de sesión en /admin. Redirigiendo... ---');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const session = await decrypt(sessionCookie);
      if (!session) {
        console.error('--- MIDDLEWARE: Cookie inválida o malformada ---');
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('session');
        return response;
      }
      console.log('--- MIDDLEWARE: Sesión válida para', session.email, '---');
    } catch (e) {
      console.error('--- MIDDLEWARE: Error al desencriptar sesión ---', e);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 2. Redireccionar si ya está logueado e intenta ir a login/registro
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session) {
        console.log('--- MIDDLEWARE: Ya logueado, saltando a /admin ---');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
