
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const { pathname } = req.nextUrl;

  // Allow requests to /admin/login
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // If there's no session, redirect to the login page for any other /admin route
  if (!session && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
