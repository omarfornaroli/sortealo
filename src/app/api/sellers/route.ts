
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import Seller from '@/models/Seller';

export async function GET() {
  await dbConnect();
  try {
    const sellers = await Seller.find({}).sort({ createdAt: -1 });
    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching sellers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();

    if (!data.firstName || !data.lastName || !data.dni) {
      return NextResponse.json({ message: 'Nombre, apellido y DNI son obligatorios' }, { status: 400 });
    }

    // Código UUID único asociado al vendedor
    if (!data.code) {
      data.code = randomUUID();
    }
    // Nombre completo para compatibilidad
    data.name = `${data.firstName} ${data.lastName}`.trim();

    const newSeller = new Seller(data);
    await newSeller.save();
    return NextResponse.json(newSeller, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'El código de vendedor ya existe' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating seller', error }, { status: 500 });
  }
}
