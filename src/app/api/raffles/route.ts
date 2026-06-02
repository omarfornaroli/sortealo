
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function GET() {
  await dbConnect();
  try {
    const raffles = await Raffle.find({}).sort({ createdAt: -1 });
    return NextResponse.json(raffles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching raffles', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
