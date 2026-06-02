
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo protegemos el panel administrativo
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Si el usuario ya está logueado e intenta ir a auth, mandarlo a admin
  if (pathname.startsWith('/auth')) {
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
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
