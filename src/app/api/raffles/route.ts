
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { decrypt } from '@/lib/session';

async function checkAuth(req: NextRequest) {
  // Ahora solo comprobamos el encabezado Authorization: Bearer <token>
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return null;
  return await decrypt(token);
}

export async function GET(req: NextRequest) {
  const session = await checkAuth(req);
  
  // Si se pide explícitamente el modo admin, validamos el token
  if (req.nextUrl.searchParams.get('admin') === 'true' && !session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();
  try {
    const raffles = await Raffle.find({}).sort({ createdAt: -1 });
    return NextResponse.json(raffles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching raffles', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await checkAuth(req);
  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();
  try {
    const data = await req.json();
    const newRaffle = new Raffle(data);
    await newRaffle.save();
    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating raffle', error }, { status: 500 });
  }
}
