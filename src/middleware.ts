
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo protegemos las rutas administrativas
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    console.log(`--- MIDDLEWARE CHECK: ${pathname} ---`);
    if (!sessionCookie) {
      console.warn('Middleware: No se encontró cookie de sesión. Redirigiendo a login...');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const session = await decrypt(sessionCookie);
      if (!session) {
        console.warn('Middleware: Sesión inválida o expirada. Limpiando y redirigiendo...');
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('session');
        return response;
      }
      console.log('Middleware: Sesión válida detectada para:', session.email);
    } catch (err) {
      console.error('Middleware: Error al desencriptar sesión:', err);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Redireccionar si el usuario ya está autenticado e intenta ir a login/register
  if (pathname.startsWith('/auth')) {
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session && pathname !== '/auth/setup-password') {
        console.log('Middleware: Usuario ya autenticado intentando entrar a ruta de auth. Redirigiendo a /admin');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
