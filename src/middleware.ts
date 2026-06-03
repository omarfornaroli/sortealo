
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;

  // 1. Proteger rutas administrativas
  if (pathname.startsWith('/admin')) {
    console.log(`--- MIDDLEWARE: Validando acceso a ${pathname} ---`);
    
    if (!sessionCookie) {
      console.warn('--- MIDDLEWARE: No se encontró cookie de sesión. Redirigiendo a /auth/login ---');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const session = await decrypt(sessionCookie);
      if (!session) {
        console.error('--- MIDDLEWARE: Token de cookie inválido o expirado. ---');
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('session');
        return response;
      }
      console.log('--- MIDDLEWARE: Acceso permitido para', session.email, '---');
    } catch (e) {
      console.error('--- MIDDLEWARE: Error crítico al validar sesión ---', e);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 2. Redireccionar si ya está logueado e intenta ir a login/registro
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session) {
        console.log('--- MIDDLEWARE: Usuario ya autenticado. Redirigiendo de auth a /admin ---');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
