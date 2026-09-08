
import mongoose, { Schema, Document } from 'mongoose';

export interface ISeller extends Document {
  firstName: string;
  lastName: string;
  dni: string;
  name: string; // Nombre completo (compatibilidad)
  code: string; // UUID único para el link
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
}

const SellerSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dni: { type: String, required: true },
  name: { type: String },
  code: { type: String, required: true, unique: true },
  email: { type: String },
  phone: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
