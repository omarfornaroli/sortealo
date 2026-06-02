
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  status: 'pending_approval' | 'pending_setup' | 'active';
  approvalToken?: string;
  setupToken?: string;
  isVerified: boolean;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  status: { 
    type: String, 
    enum: ['pending_approval', 'pending_setup', 'active'],
    default: 'pending_approval'
  },
  approvalToken: { type: String },
  setupToken: { type: String },
  isVerified: { type: Boolean, default: false }
});

// Corregido: En funciones async de Mongoose hooks no se debe usar el callback 'next'
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
