import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    external_reference: string; // ID único de la transacción (raffleId)
    raffle_id: string; // ID del sorteo
    raffle_name: string;
    user_name: string;
    user_email: string;
    user_dni: string;
    user_phone: string;
    quantity: number;
    tickets: string[]; // Array de números/tickets comprados
    unit_price: number;
    total_price: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Estado del pago
    payment_id?: string; // ID de pago de Mercado Pago
    merchant_order_id?: string;
    preference_id?: string;
    collection_status?: string;
    sellerCode?: string; // Código del vendedor que generó la venta
    createdAt: Date;
    updatedAt: Date;
    participant_added?: boolean; // Flag para saber si ya se agregó como participante
}

const PaymentSchema: Schema = new Schema({
    external_reference: { type: String, required: true, unique: true, index: true },
    raffle_id: { type: String, required: true, index: true },
    raffle_name: { type: String, required: true },
    user_name: { type: String, required: true },
    user_email: { type: String, required: true },
    user_dni: { type: String, required: true },
    user_phone: { type: String, required: true },
    quantity: { type: Number, required: true },
    tickets: [{ type: String }],
    unit_price: { type: Number, required: true },
    total_price: { type: Number, required: true },
    currency: { type: String, default: 'ARS' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    payment_id: { type: String },
    merchant_order_id: { type: String },
    preference_id: { type: String },
    collection_status: { type: String },
    sellerCode: { type: String },
    participant_added: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);