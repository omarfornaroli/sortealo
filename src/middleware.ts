
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Ya no protegemos rutas desde el middleware porque no tenemos acceso a localStorage en el servidor.
  // La protección se maneja ahora íntegramente en el cliente (Client-side protection).
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
