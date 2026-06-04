
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
    }

    // Validación robusta de participantes
    const participants = raffle.participants || [];
    if (participants.length === 0) {
      return NextResponse.json({ message: 'No hay participantes registrados para realizar el sorteo.' }, { status: 400 });
    }

    if (raffle.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha sido finalizado previamente.' }, { status: 400 });
    }

    // Lógica de sorteo: elegimos un participante al azar
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winningParticipant = participants[randomIndex];
    
    // Elegimos un número ganador al azar de los tickets que posee el ganador
    const winnerTickets = winningParticipant.tickets || [];
    if (winnerTickets.length === 0) {
        return NextResponse.json({ message: 'El participante seleccionado no tiene tickets válidos.' }, { status: 500 });
    }
    
    const winnerTicket = winnerTickets[Math.floor(Math.random() * winnerTickets.length)];

    // Actualizamos el sorteo
    raffle.isFinished = true;
    raffle.winnerEmail = winningParticipant.email;
    raffle.winnerTicket = winnerTicket;
    
    await raffle.save();

    return NextResponse.json({ 
      success: true,
      message: '¡Sorteo ejecutado con éxito!',
      winnerEmail: winningParticipant.email,
      winnerName: winningParticipant.name,
      winnerTicket
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error al ejecutar el sorteo:', error);
    return NextResponse.json({ 
      message: 'Error interno al ejecutar el sorteo', 
      error: error.message 
    }, { status: 500 });
  }
}
