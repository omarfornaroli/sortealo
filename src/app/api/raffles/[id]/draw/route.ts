
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
    }

    if (raffle.participants.length === 0) {
      return NextResponse.json({ message: 'No hay participantes para este sorteo' }, { status: 400 });
    }

    if (raffle.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha finalizado' }, { status: 400 });
    }

    // Lógica de sorteo aleatorio
    const randomIndex = Math.floor(Math.random() * raffle.participants.length);
    const winnerEmail = raffle.participants[randomIndex];
    
    // Generamos un ticket ficticio para el ganador (puedes mejorar esto)
    const winnerTicket = Math.floor(100000 + Math.random() * 900000).toString();

    raffle.isFinished = true;
    raffle.winnerEmail = winnerEmail;
    raffle.winnerTicket = winnerTicket;
    await raffle.save();

    return NextResponse.json({ 
      message: '¡Sorteo ejecutado con éxito!',
      winnerEmail,
      winnerTicket
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error al ejecutar el sorteo', error }, { status: 500 });
  }
}
