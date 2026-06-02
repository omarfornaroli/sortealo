
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo nos interesan las rutas que empiezan con /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    // Si no hay cookie y la ruta no es pública, login
    const isPublicAdminPath = 
      pathname === '/admin/login' || 
      pathname === '/admin/register' || 
      pathname === '/admin/setup-password';

    if (!sessionCookie && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      
      // Si el token es inválido y la ruta no es pública, login
      if (!session && !isPublicAdminPath) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // Si tiene sesión y está en el login, mandarlo al panel
      if (session && pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
