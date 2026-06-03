
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { sendEmail } from '@/lib/email';

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

    // 6. Enviar Email de confirmación al participante
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
              <div style="text-align: center;">
                ${ticketsHtml}
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 16px; color: #475569;"><strong>Premio:</strong> ${updatedRaffle.name}</p>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Este correo sirve como comprobante oficial de tu participación. El sorteo se realizará según lo estipulado en la plataforma.</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://sortealo.com.ar'}" 
                 style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: bold; display: inline-block; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                 Volver a Sortealo
              </a>
            </div>
            
            <p style="font-size: 12px; color: #cbd5e1; text-align: center; margin-top: 40px;">Si no realizaste esta compra, por favor ignora este mensaje.</p>
          </div>
        `
      });
      console.log('Email de confirmación enviado a:', email);
    } catch (emailErr) {
      console.error('Error al intentar enviar el email de confirmación:', emailErr);
      // No devolvemos error al cliente aquí para no arruinar la experiencia si solo falló el mail
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Participación registrada con éxito y email enviado.',
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
