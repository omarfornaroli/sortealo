
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo nos interesan las rutas administrativas
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    const isPublicAdminPath = 
      pathname === '/admin/login' || 
      pathname === '/admin/register' || 
      pathname === '/admin/setup-password';

    // 1. Si NO hay cookie y NO es una ruta pública, redirigir al login
    if (!sessionCookie && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // 2. Si hay cookie, intentar desencriptarla
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      
      // Si el token es inválido y no es ruta pública, forzar login
      if (!session) {
        if (!isPublicAdminPath) {
          const response = NextResponse.redirect(new URL('/admin/login', req.url));
          response.cookies.delete('session');
          return response;
        }
      } else {
        // Si tiene sesión activa e intenta ir al login o registro, mandarlo al dashboard
        if (isPublicAdminPath && pathname !== '/admin/setup-password') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
