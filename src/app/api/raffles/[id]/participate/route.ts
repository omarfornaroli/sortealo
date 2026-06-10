
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import Seller from '@/models/Seller';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  try {
    const body = await req.json();
    const { email, name, dni, phone, quantity, sellerCode } = body;

    // 1. Verificar existencia, finalización manual y fecha de expiración
    const raffle = await Raffle.findById(id);
    if (!raffle) {
      return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
    }

    if (raffle.isFinished) {
      return NextResponse.json({ message: 'Este sorteo ya ha finalizado' }, { status: 400 });
    }

    // Validación de fecha caducada en el servidor
    if (raffle.drawDate && new Date(raffle.drawDate) < new Date()) {
      return NextResponse.json({ message: 'La fecha límite de participación ha expirado.' }, { status: 400 });
    }

    if (raffle.soldTickets + quantity > raffle.maxTickets) {
      return NextResponse.json({ message: 'No hay suficientes tickets disponibles' }, { status: 400 });
    }

    // 2. Buscar Vendedor si existe el código
    let sellerInfo = { sellerId: undefined, sellerName: 'Venta General' };
    if (sellerCode) {
      const seller = await Seller.findOne({ code: sellerCode, active: true });
      if (seller) {
        sellerInfo = { 
          sellerId: seller._id.toString(), 
          sellerName: seller.name 
        };
      }
    }

    // 3. Obtener todos los tickets vendidos para evitar duplicados
    // Usamos una consulta rápida para traer solo los tickets
    const raffleForTickets = await Raffle.findById(id).select('participants.tickets').lean();
    const existingTickets = new Set(
      raffleForTickets?.participants?.flatMap((p: any) => p.tickets) || []
    );

    // 4. Generar números aleatorios únicos de 6 dígitos
    const generatedTickets: string[] = [];
    while (generatedTickets.length < quantity) {
      const ticket = Math.floor(100000 + Math.random() * 900000).toString();
      if (!existingTickets.has(ticket)) {
        generatedTickets.push(ticket);
        existingTickets.add(ticket);
      }
    }

    // 5. Crear el objeto de participación
    const participantData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      dni: dni.toString().trim(),
      phone: phone.trim(),
      tickets: generatedTickets,
      purchaseDate: new Date(),
      ...sellerInfo
    };

    // 6. Actualización Atómica
    const updatedRaffle = await Raffle.findOneAndUpdate(
      { _id: id, isFinished: false },
      { 
        $push: { participants: participantData },
        $inc: { soldTickets: quantity }
      },
      { new: true, runValidators: true }
    );

    if (!updatedRaffle) {
      throw new Error('No se pudo actualizar el sorteo.');
    }

    // 7. Enviar Email
    try {
      const ticketsHtml = generatedTickets
        .map(t => `<span style="display: inline-block; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px 15px; margin: 5px; border-radius: 12px; font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">${t}</span>`)
        .join('');

      await sendEmail({
        to: email.toLowerCase().trim(),
        subject: `🎟️ Tus números para el sorteo: ${updatedRaffle.name} - Sortealo`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">¡Mucha suerte, ${name}!</h1>
              <p style="font-size: 18px; color: #475569; font-weight: 500;">Has adquirido <strong>${quantity} chances</strong> con éxito.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9;">
              <p style="font-size: 14px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px; text-align: center;">Tus números asignados</p>
              <div style="text-align: center;">${ticketsHtml}</div>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">ID de transacción: ${updatedRaffle._id}</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Error enviando email:', emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      tickets: generatedTickets 
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al procesar la participación', error: error.message }, { status: 500 });
  }
}
