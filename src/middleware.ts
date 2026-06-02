
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas de administración
  if (pathname.startsWith('/admin')) {
    const session = await getSession();

    // Rutas públicas dentro de /admin que NO requieren sesión
    const isPublicAdminPath = 
      pathname === '/admin/login' || 
      pathname === '/admin/register' || 
      pathname === '/admin/setup-password';

    // Si el usuario ya tiene sesión y trata de ir al login, mandarlo al panel
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
