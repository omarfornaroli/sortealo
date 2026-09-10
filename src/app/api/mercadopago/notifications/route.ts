import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Raffle from '@/models/Raffle';
import Settings from '@/models/Settings';
import { sendEmail } from '@/lib/email';
import Seller from '@/models/Seller';

// Función para generar números aleatorios únicos
function generateUniqueTickets(
    quantity: number,
    existingTickets: Set<string>,
    maxNumber: number = 10000,
    maxRetries: number = 100
): string[] {
    const tickets: Set<string> = new Set();
    let retries = 0;

    while (tickets.size < quantity && retries < maxRetries) {
        const randomNum = Math.floor(Math.random() * maxNumber) + 1;
        const ticketStr = String(randomNum).padStart(4, '0');

        if (!existingTickets.has(ticketStr) && !tickets.has(ticketStr)) {
            tickets.add(ticketStr);
        }

        retries++;
    }

    if (tickets.size < quantity) {
        throw new Error(
            `No se pudieron generar ${quantity} números únicos después de ${maxRetries} intentos`
        );
    }

    return Array.from(tickets);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('[notifications] Webhook recibido:', JSON.stringify(body));

        // Validar que sea un webhook de payment
        if (body.type !== 'payment') {
            return NextResponse.json({ message: 'Not a payment webhook' }, { status: 400 });
        }

        const paymentId = body.data?.id;
        if (!paymentId) {
            return NextResponse.json({ message: 'No payment ID provided' }, { status: 400 });
        }

        console.log('[notifications] paymentId:', paymentId);

        1. Consultar el detalle del pago a la API de Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
        });

        // const mpResponse = {
        //     ok: true,
        //     status: "",
        //     json: async () => ({
        //         status: 'approved',
        //         external_reference: "7f1ba110-c159-46fd-b027-8d88f5616ccc"
        //     }),
        // }

        if (!mpResponse.ok) {
            console.error('[notifications] Error fetching payment from Mercado Pago:', mpResponse.status);
            return NextResponse.json(
                { message: 'Error fetching payment details from Mercado Pago' },
                { status: 502 }
            );
        }

        const paymentData = await mpResponse.json();
        console.log('[notifications] Datos de MP:', {
            status: paymentData.status,
            external_reference: paymentData.external_reference,
        });

        // 2. Recuperar el external_reference (nuestro ID de orden)
        const externalReference = paymentData.external_reference;
        if (!externalReference) {
            return NextResponse.json({ message: 'No external_reference in payment data' }, { status: 400 });
        }

        await dbConnect();

        // Buscar el Payment por external_reference directamente
        const payment = await Payment.findOne({ external_reference: externalReference });
        console.log('[notifications] Payment encontrado:', payment?._id, 'sellerCode:', payment?.sellerCode);

        if (!payment) {
            return NextResponse.json(
                { message: 'Payment not found in database' },
                { status: 404 }
            );
        }

        // 3. Mapear estado de MP a nuestro estado
        const mpStatus = paymentData.status; // 'approved', 'pending', 'rejected', etc.
        const isApproved = mpStatus === 'approved';
        console.log('[notifications] Estado MP:', mpStatus, 'isApproved:', isApproved);

        // 4. Actualizar el pago con datos de Mercado Pago
        await Payment.updateOne(
            { external_reference: externalReference },
            {
                payment_id: paymentId.toString(),
                status: isApproved ? 'approved' : mpStatus,
            }
        );
        console.log('[notifications] Payment actualizado con status:', isApproved ? 'approved' : mpStatus);

        // Si el pago fue aprobado, registrar al participante
        if (isApproved && !payment.participant_added) {
            console.log('[notifications] Procesando participante para payment aprobado');

            // 1. Obtener el raffle
            const raffle = await Raffle.findById(payment.raffle_id);
            console.log('[notifications] Raffle encontrado:', raffle?._id);

            if (!raffle) {
                console.error('[notifications] Raffle not found:', payment.raffle_id);
                return NextResponse.json(
                    { message: 'Raffle not found' },
                    { status: 404 }
                );
            }

            try {
                // 2. Obtener tickets existentes del raffle
                const existingTickets = new Set<string>(
                    (raffle.participants?.flatMap((p: any) => p.tickets) || []) as string[]
                );

                // 3. Generar números únicos y aleatorios
                const generatedTickets = generateUniqueTickets(
                    payment.quantity,
                    existingTickets,
                    raffle.maxTicketNumber || 10000
                );
                console.log('[notifications] Tickets generados:', generatedTickets);

                // 4. Actualizar el Payment con los tickets generados
                await Payment.updateOne(
                    { external_reference: externalReference },
                    { tickets: generatedTickets }
                );


                // 5. Crear el objeto de participante
                const participantData = {
                    email: payment.user_email.toLowerCase().trim(),
                    name: payment.user_name.trim(),
                    dni: payment.user_dni.trim(),
                    phone: payment.user_phone.trim(),
                    tickets: generatedTickets,
                    purchaseDate: new Date(),
                    external_reference: payment.external_reference,
                    acceptedTerms: true,
                    sellerCode: payment.sellerCode || undefined
                };
                console.log('[notifications] participantData:', JSON.stringify(participantData));

                // 6. Agregar al raffle
                const updatedRaffle = await Raffle.findOneAndUpdate(
                    { _id: payment.raffle_id, isFinished: false },
                    {
                        $push: { participants: participantData },
                        $inc: { soldTickets: payment.quantity },
                    },
                    { new: true, runValidators: true }
                );

                if (!updatedRaffle) {
                    console.error('[notifications] Failed to update raffle');
                    return NextResponse.json(
                        { message: 'No se pudo actualizar el sorteo' },
                        { status: 400 }
                    );
                }
                console.log('[notifications] Participante agregado al raffle exitosamente');

                // 7. Marcar como participante agregado
                await Payment.updateOne(
                    { external_reference: externalReference },
                    { participant_added: true }
                );
                console.log('[notifications] Payment marcado como participant_added: true');

                // 8. Enviar email
                try {
                    // Load email templates from Settings
                    const settings = await Settings.findOne().lean();
                    const subjectTemplate = settings?.purchaseEmailSubject || `Tus números para el sorteo: ${updatedRaffle.name}`;
                    const bodyTemplate = settings?.purchaseEmailBody || '';

                    const ticketsHtml = generatedTickets
                        .map(t => `<span style=\"display: inline-block; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px 15px; margin: 5px; border-radius: 12px; font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">${t}</span>`)
                        .join('');

                    // Simple placeholder replacement
                    const replace = (template: string) =>
                        template
                            .replace(/{{\s*name\s*}}/g, payment.user_name)
                            .replace(/{{\s*quantity\s*}}/g, String(payment.quantity))
                            .replace(/{{\s*raffleName\s*}}/g, updatedRaffle.name)
                            .replace(/{{\s*ticketsHtml\s*}}/g, ticketsHtml)
                            .replace(/{{\s*setupLink\s*}}/g, '');

                    const subject = replace(subjectTemplate);
                    const html = replace(bodyTemplate);

                    console.log(`[notifications] Enviando email con asunto: "${subject}"`);
                    await sendEmail({
                        to: payment.user_email.toLowerCase().trim(),
                        subject,
                        html
                    });
                    console.log(`[notifications] Email enviado correctamente a ${payment.user_email}`);
                } catch (emailErr: any) {
                    console.error(`[notifications] Error enviando email a ${payment.user_email}:`, emailErr?.message || emailErr, emailErr?.stack);
                }
            } catch (generateError: any) {
                console.error('[notifications] Error generating tickets:', generateError);
                return NextResponse.json(
                    {
                        message: 'Error generando números para el participante',
                        error: generateError.message,
                    },
                    { status: 500 }
                );
            }
        }

        console.log('[notifications] Webhook procesado completamente');
        return NextResponse.json(
            { message: 'Payment processed successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[notifications] Error processing payment webhook:', error);
        return NextResponse.json(
            {
                message: 'Error processing payment webhook',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}