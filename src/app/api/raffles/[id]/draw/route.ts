
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import Settings from '@/models/Settings';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    // Usamos .lean() para obtener los datos crudos y evitar problemas con subdocumentos en Mongoose
    const raffleData = await Raffle.findById(id).lean();

    if (!raffleData) {
      return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
    }

    const participants = raffleData.participants || [];

    if (participants.length === 0) {
      console.log('Intento de sorteo fallido: No hay participantes en la base de datos para el ID:', id);
      return NextResponse.json({ message: 'No hay participantes registrados para realizar el sorteo.' }, { status: 400 });
    }

    if (raffleData.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha sido finalizado previamente.' }, { status: 400 });
    }

    // Nueva lógica de sorteo: asignar premios en orden a los participantes seleccionados
    const prizes = raffleData.prizes || [];
    const prizeWinners: { email: string; name: string; ticket: string; phone?: string; ticketCount?: number; tickets?: string[] }[] = [];

    // Si no hay premios definidos, mantenemos el comportamiento anterior (un solo ganador)
    if (prizes.length === 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winningParticipant = participants[randomIndex];
      const winnerTickets = winningParticipant.tickets || [];
      if (winnerTickets.length === 0) {
        return NextResponse.json({ message: 'El participante seleccionado no tiene tickets válidos.' }, { status: 500 });
      }
      const winnerTicket = winnerTickets[Math.floor(Math.random() * winnerTickets.length)];
      await Raffle.findByIdAndUpdate(id, {
        isFinished: true,
        winnerEmail: winningParticipant.email,
        winnerTicket: winnerTicket
      });
      // Envío de email para el único ganador
      try {
        const settings = await Settings.findOne().lean();
        const subjectTemplate = settings?.winnerEmailSubject || `¡Felicidades, {{name}}!`;
        const bodyTemplate = settings?.winnerEmailBody || '';
        const replace = (template: string) =>
          template
            .replace(/{{\s*name\s*}}/g, winningParticipant.name)
            .replace(/{{\s*raffleName\s*}}/g, raffleData.name)
            .replace(/{{\s*winnerTicket\s*}}/g, winnerTicket)
            .replace(/{{\s*winnerEmail\s*}}/g, winningParticipant.email);
        const subject = replace(subjectTemplate);
        const html = replace(bodyTemplate);
        await sendEmail({ to: winningParticipant.email, subject, html });
      } catch (emailErr) {
        console.error('Error enviando email al ganador:', emailErr);
      }
      return NextResponse.json({
        success: true,
        message: '¡Sorteo ejecutado con éxito!',
        winnerEmail: winningParticipant.email,
        winnerName: winningParticipant.name,
        winnerTicket
      }, { status: 200 });
    }

    // Copiamos la lista de participantes para evitar repetir ganadores
    const remainingParticipants = [...participants];
    for (let i = 0; i < prizes.length; i++) {
      if (remainingParticipants.length === 0) {
        // No hay más participantes, terminamos el bucle
        break;
      }
      const randIdx = Math.floor(Math.random() * remainingParticipants.length);
      const participant = remainingParticipants.splice(randIdx, 1)[0]; // lo removemos
      const tickets = participant.tickets || [];
      if (tickets.length === 0) {
        // Si el participante no tiene tickets válidos, lo omitimos y continuamos con el siguiente premio
        i--; // reintentar este premio con otro participante
        continue;
      }
      const ticket = tickets[Math.floor(Math.random() * tickets.length)];
      prizeWinners.push({
        email: participant.email,
        name: participant.name,
        ticket,
        phone: participant.phone,
        ticketCount: participant.tickets?.length,
        tickets: participant.tickets,
      });
    }

    // Actualizamos el sorteo con los ganadores de cada premio y, opcionalmente, los campos legacy del primer premio
    const updateData: any = { isFinished: true, prizeWinners };
    if (prizeWinners.length > 0) {
      updateData.winnerEmail = prizeWinners[0].email;
      updateData.winnerTicket = prizeWinners[0].ticket;
    }
    await Raffle.findByIdAndUpdate(id, updateData);

    // Envío de correos a cada ganador usando la misma plantilla
    try {
      const settings = await Settings.findOne().lean();
      const subjectTemplate = settings?.winnerEmailSubject || `¡Felicidades, {{name}}!`;
      const bodyTemplate = settings?.winnerEmailBody || '';
      const replace = (template: string, winner: { email: string; name: string; ticket: string }) =>
        template
          .replace(/{{\s*name\s*}}/g, winner.name)
          .replace(/{{\s*raffleName\s*}}/g, raffleData.name)
          .replace(/{{\s*winnerTicket\s*}}/g, winner.ticket)
          .replace(/{{\s*winnerEmail\s*}}/g, winner.email);
      for (const winner of prizeWinners) {
        const subject = replace(subjectTemplate, winner);
        const html = replace(bodyTemplate, winner);
        await sendEmail({ to: winner.email, subject, html });
      }
    } catch (emailErr) {
      console.error('Error enviando email a los ganadores:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: '¡Sorteo ejecutado con éxito!',
      prizeWinners,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error al ejecutar el sorteo:', error);
    return NextResponse.json({
      message: 'Error interno al ejecutar el sorteo',
      error: error.message
    }, { status: 500 });
  }
}
