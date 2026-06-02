
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo protegemos las rutas administrativas
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      // Si la cookie es inválida o expiró, redirigimos y limpiamos
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Redireccionar si el usuario ya está autenticado e intenta ir a login/register
  if (pathname.startsWith('/auth')) {
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      // Evitamos el bucle de redirección en setup-password
      if (session && pathname !== '/auth/setup-password') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
