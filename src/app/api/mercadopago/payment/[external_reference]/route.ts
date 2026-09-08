import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET(req: NextRequest, { params }: { params: Promise<{ external_reference: string }> }) {
    try {
        const { external_reference } = await params;

        if (!external_reference) {
            return NextResponse.json({ message: 'external_reference es requerido' }, { status: 400 });
        }

        await dbConnect();

        // Buscar la transacción de pago
        const payment = await Payment.findOne({ external_reference }).lean();

        if (!payment) {
            return NextResponse.json({ message: 'Transacción no encontrada' }, { status: 404 });
        }

        return NextResponse.json(payment, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching payment:', error);
        return NextResponse.json({
            message: 'Error fetching payment',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

// Endpoint para actualizar el estado de pago (cuando Mercado Pago retorna)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ external_reference: string }> }) {
    try {
        const { external_reference } = await params;
        const { status, payment_id, merchant_order_id, collection_status } = await req.json();

        if (!external_reference) {
            return NextResponse.json({ message: 'external_reference es requerido' }, { status: 400 });
        }

        await dbConnect();

        const updatedPayment = await Payment.findOneAndUpdate(
            { external_reference },
            {
                status: status || 'pending',
                payment_id: payment_id,
                merchant_order_id: merchant_order_id,
                collection_status: collection_status,
            },
            { new: true }
        );

        if (!updatedPayment) {
            return NextResponse.json({ message: 'Transacción no encontrada' }, { status: 404 });
        }

        return NextResponse.json(updatedPayment, { status: 200 });
    } catch (error: any) {
        console.error('Error updating payment:', error);
        return NextResponse.json({
            message: 'Error updating payment',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
