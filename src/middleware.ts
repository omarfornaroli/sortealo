
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo nos interesan las rutas que empiezan con /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    const session = await decrypt(sessionCookie);

    // Rutas públicas dentro de /admin
    const isPublicAdminPath = 
      pathname === '/admin/login' || 
      pathname === '/admin/register' || 
      pathname === '/admin/setup-password';

    // Si ya tiene sesión y está en el login, mandarlo al panel
    if (session && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Si NO tiene sesión y la ruta NO es pública, mandarlo al login
    if (!session && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
