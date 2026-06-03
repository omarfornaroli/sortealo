
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
  try {
    const { raffleId, raffleName, unitPrice, quantity, user } = await req.json();

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ message: 'Mercado Pago access token not configured' }, { status: 500 });
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: raffleId,
            title: `Sorteo: ${raffleName} (${quantity} chances)`,
            quantity: 1,
            unit_price: unitPrice, // El precio ya viene calculado con descuentos del cliente
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${baseUrl}/raffles/${raffleId}?status=success&qty=${quantity}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone)}`,
          failure: `${baseUrl}/raffles/${raffleId}?status=failure`,
          pending: `${baseUrl}/raffles/${raffleId}?status=pending`,
        },
        auto_return: 'all',
        external_reference: raffleId,
        metadata: {
          raffle_id: raffleId,
          user_name: user.name,
          user_email: user.email,
          user_phone: user.phone,
          quantity: quantity
        }
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error('MP Preference Error:', error);
    return NextResponse.json({ message: 'Error creating payment preference', error: error.message }, { status: 500 });
  }
}
