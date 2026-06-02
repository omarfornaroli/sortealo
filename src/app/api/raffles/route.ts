
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function GET() {
  await dbConnect();
  try {
    const raffles = await Raffle.find({});
    return NextResponse.json(raffles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching raffles', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name, description, imageUrl } = await req.json();

  try {
    const newRaffle = new Raffle({ name, description, imageUrl });
    await newRaffle.save();
    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating raffle', error }, { status: 500 });
  }
}
