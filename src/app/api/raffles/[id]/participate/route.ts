
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  
  try {
    const body = await req.json();
    const { email, name, dni, phone, quantity } = body;

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

    // Obtener todos los tickets ya vendidos para evitar duplicados en este sorteo
    const existingTickets = new Set(
      raffle.participants.flatMap((p: any) => p.tickets)
    );

    // Generar números aleatorios únicos de 6 dígitos
    const generatedTickets: string[] = [];
    while (generatedTickets.length < quantity) {
      const ticket = Math.floor(100000 + Math.random() * 900000).toString();
      if (!existingTickets.has(ticket)) {
        generatedTickets.push(ticket);
        existingTickets.add(ticket); // Evitar duplicados en la misma transacción
      }
    }

    // Importante: Empujar el objeto respetando el esquema IParticipant
    raffle.participants.push({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      dni: dni.toString().trim(),
      phone: phone.trim(),
      tickets: generatedTickets,
      purchaseDate: new Date()
    });

    raffle.soldTickets += quantity;
    
    // El save() de Mongoose disparará la validación del esquema
    await raffle.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Participación registrada con éxito',
      tickets: generatedTickets 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error en participate API:', error);
    return NextResponse.json({ 
      message: 'Error al procesar la participación', 
      error: error.message 
    }, { status: 500 });
  }
}
