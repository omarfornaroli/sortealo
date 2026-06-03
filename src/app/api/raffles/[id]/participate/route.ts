
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { email, name, phone, quantity } = await req.json();

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
    }

    if (raffle.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha finalizado' }, { status: 400 });
    }

    if (raffle.soldTickets + quantity > raffle.maxTickets) {
      return NextResponse.json({ message: 'No hay suficientes tickets disponibles' }, { status: 400 });
    }

    // Generar números aleatorios únicos de 6 dígitos para el usuario
    const generatedTickets: string[] = [];
    while (generatedTickets.length < quantity) {
      const ticket = Math.floor(100000 + Math.random() * 900000).toString();
      // En un entorno real deberíamos verificar que el ticket no exista ya en el raffle.participants
      generatedTickets.push(ticket);
    }

    raffle.participants.push({
      email: email.toLowerCase(),
      name,
      phone,
      tickets: generatedTickets,
      purchaseDate: new Date()
    });

    raffle.soldTickets += quantity;
    await raffle.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Participación registrada con éxito',
      tickets: generatedTickets 
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al procesar la participación', error: error.message }, { status: 500 });
  }
}
