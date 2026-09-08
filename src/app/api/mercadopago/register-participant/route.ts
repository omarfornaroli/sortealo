import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Raffle from '@/models/Raffle';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { external_reference } = await req.json();

        if (!external_reference) {
            return NextResponse.json({ message: 'external_reference es requerido' }, { status: 400 });
        }

        await dbConnect();

        // 1. Obtener los datos de pago
        const payment = await Payment.findOne({ external_reference });
        if (!payment) {
            return NextResponse.json({ message: 'Transacción no encontrada' }, { status: 404 });
        }

        // 2. Verificar si ya se agregó como participante
        if (payment.participant_added) {
            return NextResponse.json({
                message: 'Participante ya fue registrado',
                participant: payment
            }, { status: 200 });
        }

        // 3. Obtener el raffle
        const raffle = await Raffle.findById(payment.raffle_id);
        if (!raffle) {
            return NextResponse.json({ message: 'Sorteo no encontrado' }, { status: 404 });
        }

        // 4. Verificar que no existan los números ya
        const existingTickets = new Set(
            raffle.participants?.flatMap((p: any) => p.tickets) || []
        );

        // Si los números ya existen parcialmente, devolver error
        const duplicates = payment.tickets.filter((n: string) => existingTickets.has(n));
        if (duplicates.length > 0) {
            return NextResponse.json({
                message: 'Algunos números ya fueron asignados',
                duplicates
            }, { status: 409 });
        }

        // 5. Crear el objeto de participante
        const participantData = {
            email: payment.user_email.toLowerCase().trim(),
            name: payment.user_name.trim(),
            dni: payment.user_dni.trim(),
            phone: payment.user_phone.trim(),
            tickets: payment.tickets,
            purchaseDate: new Date(),
            external_reference: payment.external_reference,
            acceptedTerms: true,
        };

        // 6. Agregar al raffle
        const updatedRaffle = await Raffle.findOneAndUpdate(
            { _id: payment.raffle_id, isFinished: false },
            {
                $push: { participants: participantData },
                $inc: { soldTickets: payment.quantity }
            },
            { new: true, runValidators: true }
        );

        if (!updatedRaffle) {
            return NextResponse.json({ message: 'No se pudo actualizar el sorteo' }, { status: 400 });
        }

        // 7. Marcar como participante agregado
        await Payment.updateOne(
            { external_reference },
            { participant_added: true }
        );

        // 8. Enviar email (opcional)
        try {
            await sendEmail({
                to: payment.user_email,
                subject: `¡Pago confirmado! - Sorteo: ${payment.raffle_name}`,
                html: `
          <h2>¡Gracias por tu compra!</h2>
          <p>Tu pago ha sido confirmado exitosamente.</p>
          <h3>Detalles:</h3>
          <p><strong>Sorteo:</strong> ${payment.raffle_name}</p>
          <p><strong>Cantidad:</strong> ${payment.quantity} números</p>
          <p><strong>Monto:</strong> $${payment.total_price.toLocaleString('es-AR')}</p>
          <h3>Números:</h3>
          <p>${payment.numbers.join(', ')}</p>
        `,
            });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // No fallar el registro si el email falla
        }

        return NextResponse.json({
            message: 'Participante registrado exitosamente',
            raffle: updatedRaffle
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error registering participant:', error);
        return NextResponse.json({
            message: 'Error registering participant',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
