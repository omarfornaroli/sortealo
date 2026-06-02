
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;

  console.log(`--- MIDDLEWARE: ${pathname} | Cookie: ${sessionCookie ? 'Presente' : 'Ausente'} ---`);

  // 1. Proteger rutas administrativas
  if (pathname.startsWith('/admin')) {
    // Si no hay cookie, el servidor redirige. 
    // Nota: El cliente también verificará localStorage como doble factor.
    if (!sessionCookie) {
      console.log('Middleware: Sin sesión para /admin. Redirigiendo a login...');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      console.log('Middleware: Token inválido. Redirigiendo...');
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // 2. Redireccionar si ya está logueado
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
