
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

    if (!raffle.participants || raffle.participants.length === 0) {
      return NextResponse.json({ message: 'No hay participantes para este sorteo' }, { status: 400 });
    }

    if (raffle.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha finalizado' }, { status: 400 });
    }

    // Lógica de sorteo aleatorio: elegimos un participante al azar
    const randomIndex = Math.floor(Math.random() * raffle.participants.length);
    const winningParticipant = raffle.participants[randomIndex];
    
    // Elegimos uno de los tickets del ganador al azar
    const winnerTicket = winningParticipant.tickets[Math.floor(Math.random() * winningParticipant.tickets.length)];

    raffle.isFinished = true;
    raffle.winnerEmail = winningParticipant.email;
    raffle.winnerTicket = winnerTicket;
    
    await raffle.save();

    return NextResponse.json({ 
      message: '¡Sorteo ejecutado con éxito!',
      winnerEmail: winningParticipant.email,
      winnerName: winningParticipant.name,
      winnerTicket
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error al ejecutar el sorteo:', error);
    return NextResponse.json({ 
      message: 'Error al ejecutar el sorteo', 
      error: error.message 
    }, { status: 500 });
  }
}
