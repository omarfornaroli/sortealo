
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { email } = await req.json();

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Raffle not found' }, { status: 404 });
    }

    if (raffle.participants.includes(email)) {
      return NextResponse.json({ message: 'You have already participated in this raffle' }, { status: 400 });
    }

    raffle.participants.push(email);
    await raffle.save();

    return NextResponse.json({ message: 'You have successfully participated in the raffle' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error participating in raffle', error }, { status: 500 });
  }
}
