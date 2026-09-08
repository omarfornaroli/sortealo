
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { randomUUID } from 'crypto';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
  try {
    const { raffleId, raffleName, unitPrice, quantity, user } = await req.json();

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

    // Mercado Pago requiere URLs absolutas y válidas.
    // Usamos la variable de entorno NEXT_PUBLIC_BASE_URL como base.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    // URLs de retorno para los distintos estados del pago.
    const successUrl = `${baseUrl}/mercadopago/success?external_reference=${externalReference}`;
    const failureUrl = `${baseUrl}/mercadopago/failure`;
    const pendingUrl = `${baseUrl}/mercadopago/pending`;

    const totalPrice = Number(unitPrice);

    // Crear el registro de pago en la BD
    await Payment.create({
      external_reference: externalReference,
      raffle_id: raffleId,
      raffle_name: raffleName,
      user_name: user.name,
      user_email: user.email,
      user_dni: user.dni,
      user_phone: user.phone,
      quantity: quantity,
      unit_price: Number(unitPrice),
      total_price: totalPrice,
      currency: 'ARS',
      status: 'pending',
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: raffleId,
            title: `Sorteo: ${raffleName} (${quantity} chances)`,
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
        }
      },
    });

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
