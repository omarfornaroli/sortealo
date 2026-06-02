
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo nos interesan las rutas que empiezan con /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    
    const isPublicAdminPath = 
      pathname === '/admin/login' || 
      pathname === '/admin/register' || 
      pathname === '/admin/setup-password';

    // 1. Si NO hay cookie y NO es una ruta pública, redirigir al login
    if (!sessionCookie && !isPublicAdminPath) {
      console.log('Middleware: No hay cookie, redirigiendo a login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // 2. Si hay cookie, intentar desencriptarla
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      
      // Si el token es inválido y no es ruta pública, forzar login
      if (!session && !isPublicAdminPath) {
        console.log('Middleware: Token inválido, redirigiendo a login');
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('session'); // Limpiar cookie corrupta
        return response;
      }

      // Si tiene sesión activa e intenta ir al login, mandarlo al dashboard
      if (session && isPublicAdminPath && pathname !== '/admin/setup-password') {
        console.log('Middleware: Sesión activa, redirigiendo a dashboard');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
