
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
  try {
    const { raffleId, raffleName, unitPrice, quantity, user } = await req.json();

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ message: 'Mercado Pago access token not configured' }, { status: 500 });
    }

    // Mercado Pago requiere URLs absolutas y válidas. 
    // Tal como solicitaste, usamos google.com por ahora para depuración.
    // Nota: Al usar google.com, el proceso de registro automático de números no se ejecutará
    // ya que el usuario no regresará a la aplicación.
    const successUrl = 'https://www.google.com';
    const failureUrl = 'https://www.google.com';
    const pendingUrl = 'https://www.google.com';

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
        external_reference: raffleId,
        notification_url: '', // Opcional: para webhooks en producción
        metadata: {
          raffle_id: raffleId,
          user_name: user.name,
          user_email: user.email,
          user_phone: user.phone,
          quantity: quantity
        }
      },
    });

    if (!result.init_point) {
      throw new Error('No init_point returned from Mercado Pago');
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
