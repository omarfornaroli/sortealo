
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json(raffle, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching raffle', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { name, description, imageUrl, isFinished } = await req.json();

  try {
    const updatedRaffle = await Raffle.findByIdAndUpdate(
      id,
      { name, description, imageUrl, isFinished },
      { new: true }
    );
    if (!updatedRaffle) {
      return NextResponse.json({ message: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json(updatedRaffle, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating raffle', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    const deletedRaffle = await Raffle.findByIdAndDelete(id);
    if (!deletedRaffle) {
      return NextResponse.json({ message: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Raffle deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting raffle', error }, { status: 500 });
  }
}
