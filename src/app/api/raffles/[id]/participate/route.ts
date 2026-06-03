
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  try {
    const body = await req.json();
    const { email, name, dni, phone, quantity } = body;

    // 1. Verificar existencia y disponibilidad
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

    // 2. Obtener todos los tickets vendidos para evitar duplicados
    const existingTickets = new Set(
      raffle.participants.flatMap((p: any) => p.tickets)
    );

    // 3. Generar números aleatorios únicos de 6 dígitos
    const generatedTickets: string[] = [];
    while (generatedTickets.length < quantity) {
      const ticket = Math.floor(100000 + Math.random() * 900000).toString();
      if (!existingTickets.has(ticket)) {
        generatedTickets.push(ticket);
        existingTickets.add(ticket);
      }
    }

    // 4. Crear el objeto de participación respetando el esquema
    const participantData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      dni: dni.toString().trim(),
      phone: phone.trim(),
      tickets: generatedTickets,
      purchaseDate: new Date()
    };

    // 5. Actualización Atómica para evitar errores de validación de Mongoose
    const updatedRaffle = await Raffle.findOneAndUpdate(
      { _id: id, isFinished: false },
      { 
        $push: { participants: participantData },
        $inc: { soldTickets: quantity }
      },
      { new: true, runValidators: true }
    );

    if (!updatedRaffle) {
      throw new Error('No se pudo actualizar el sorteo. Es posible que haya finalizado justo ahora.');
    }

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
