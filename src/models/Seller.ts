
import mongoose, { Schema, Document } from 'mongoose';

export interface ISeller extends Document {
  name: string;
  code: string; // Código único para el link (slug)
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
}

const SellerSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: { type: String },
  phone: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
