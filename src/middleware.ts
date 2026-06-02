
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const { pathname } = req.nextUrl;

  // Rutas públicas de administración que no requieren sesión
  const publicAdminPaths = [
    '/admin/login',
    '/admin/register',
    '/admin/setup-password'
  ];

  const isPublicPath = publicAdminPaths.some(path => pathname.startsWith(path));

  // Si es una ruta de admin y no es pública, verificar sesión
  if (pathname.startsWith('/admin') && !isPublicPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
