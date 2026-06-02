
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }

  return NextResponse.json({ isAuthenticated: true, user: session }, { status: 200 });
}
