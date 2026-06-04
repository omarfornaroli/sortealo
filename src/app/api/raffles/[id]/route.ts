
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    // Aseguramos que se devuelva el objeto completo sin exclusiones
    const raffle = await Raffle.findById(id).lean();
    if (!raffle) {
      return NextResponse.json({ message: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json(raffle, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching raffle', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const data = await req.json();

  try {
    const updatedRaffle = await Raffle.findByIdAndUpdate(
      id,
      { ...data },
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

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
