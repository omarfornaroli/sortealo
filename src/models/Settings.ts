
import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  heroBackgroundImageUrl: string;
  siteName: string;
}

const SettingsSchema: Schema = new Schema({
  heroBackgroundImageUrl: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1568605117036-5fe5e790b738?q=80&w=2070&auto=format&fit=crop' 
  },
  siteName: { type: String, default: 'Sortealo' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
