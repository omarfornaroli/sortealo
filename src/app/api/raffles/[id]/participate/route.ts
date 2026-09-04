
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import Seller from '@/models/Seller';
import { sendEmail } from '@/lib/email';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    const body = await req.json();
    const { email, name, dni, phone, quantity, sellerCode, acceptedTerms } = body;

    // 1. Verificar existencia, finalización manual y fecha de expiración
    if (!acceptedTerms) {
      return NextResponse.json({ message: 'Debe aceptar los Términos y Condiciones' }, { status: 400 });
    }

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
      ...sellerInfo,
      acceptedTerms: !!acceptedTerms
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
      // Load email templates from Settings
      const settings = await Settings.findOne().lean();
      const subjectTemplate = settings?.purchaseEmailSubject || `Tus números para el sorteo: ${updatedRaffle.name}`;
      const bodyTemplate = settings?.purchaseEmailBody || '';

      const ticketsHtml = generatedTickets
        .map(t => `<span style="display: inline-block; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px 15px; margin: 5px; border-radius: 12px; font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">${t}</span>`)
        .join('');

      // Simple placeholder replacement
      const replace = (template: string) =>
        template
          .replace(/{{\s*name\s*}}/g, name)
          .replace(/{{\s*quantity\s*}}/g, String(quantity))
          .replace(/{{\s*raffleName\s*}}/g, updatedRaffle.name)
          .replace(/{{\s*ticketsHtml\s*}}/g, ticketsHtml)
          .replace(/{{\s*winnerTicket\s*}}/g, '') // not used here
          .replace(/{{\s*setupLink\s*}}/g, '');

      const subject = replace(subjectTemplate);
      const html = replace(bodyTemplate);

      await sendEmail({
        to: email.toLowerCase().trim(),
        subject,
        html
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
