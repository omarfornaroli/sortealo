import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { randomUUID } from 'crypto';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
  try {
    const { raffleId, raffleName, unitPrice, ticketOption, quantity, user } = await req.json();

    console.log('[preference] Datos recibidos - user:', JSON.stringify(user));
    console.log('[preference] sellerCode en user:', user?.sellerCode);

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ message: 'Mercado Pago access token not configured' }, { status: 500 });
    }

    // Validar datos requeridos
    if (!user.name || !user.email || !user.phone || !user.dni) {
      return NextResponse.json({ message: 'Faltan datos requeridos del usuario (name, email, phone, dni)' }, { status: 400 });
    }

    // Conectar a la base de datos
    await dbConnect();

    // Generar un UUID único para esta transacción
    const externalReference = randomUUID();

    console.log('[preference] externalReference generado:', externalReference);

    // Mercado Pago requiere URLs absolutas y válidas.
    // Usamos la variable de entorno NEXT_PUBLIC_BASE_URL como base.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    // URLs de retorno para los distintos estados del pago.
    const successUrl = `${baseUrl}/mercadopago/success?external_reference=${externalReference}`;
    const failureUrl = `${baseUrl}/mercadopago/failure`;
    const pendingUrl = `${baseUrl}/mercadopago/pending`;

    const totalPrice = Number(unitPrice);

    // CREAR EL REGISTRO DE PAGO EN LA BD - CON sellerCode
    const paymentData = {
      external_reference: externalReference,
      raffle_id: raffleId,
      raffle_name: raffleName,
      user_name: user.name,
      user_email: user.email,
      user_dni: user.dni,
      user_phone: user.phone,
      sellerCode: user.sellerCode || undefined,
      quantity: quantity,
      unit_price: Number(unitPrice),
      total_price: totalPrice,
      currency: 'ARS',
      status: 'pending',
    };

    console.log('[preference] Guardando Payment en BD:', JSON.stringify(paymentData));
    console.log('[preference] sellerCode que se guardará:', paymentData.sellerCode);

    await Payment.create(paymentData);

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: raffleId,
            title: ticketOption?.description || `Curso velas aromaticas chances`,
            quantity: 1,
            unit_price: Number(unitPrice),
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: 'approved',
        external_reference: externalReference,
        notification_url: '', // Opcional: para webhooks en producción
        metadata: {
          raffle_id: raffleId,
          user_name: user.name,
          user_email: user.email,
          user_dni: user.dni,
          user_phone: user.phone,
          quantity: quantity,
          sellerCode: user.sellerCode || undefined
        }
      },
    });

    console.log("title", ticketOption?.description || `Curso velas aromaticas chances`);
    console.log('[preference] Respuesta Mercado Pago:', result?.init_point ? 'OK' : 'FAIL');

    if (!result.init_point) {
      throw new Error('No init_point returned from Mercado Pago');
    }

    // Actualizar el preference_id y payment_id en el pago si existen
    const updateData: any = {};
    if (result.id) {
      updateData.preference_id = result.id;
    }

    if (Object.keys(updateData).length > 0) {
      await Payment.updateOne(
        { external_reference: externalReference },
        updateData
      );
      console.log('[preference] Payment actualizado con preference_id:', result.id);
    }

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error('MP Preference Error:', error);
    return NextResponse.json({
      message: 'Error creating payment preference',
      error: error.message || 'Unknown error',
      detail: error.cause || error
    }, { status: 500 });
  }
}
