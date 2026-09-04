import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  heroBackgroundImageUrl: string;
  heroBadgeText: string;
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  sponsorsTitle: string;
  sponsors: string[];
  activeRafflesTitle: string;
  activeRafflesSubtitle: string;
  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

const SettingsSchema: Schema = new Schema({
  siteName: { type: String, default: 'Sortealo' },
  heroBackgroundImageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1568605117036-5fe5e790b738?q=80&w=2070&auto=format&fit=crop'
  },
  heroBadgeText: { type: String, default: 'Sorteos de Élite en Argentina' },
  heroTitle: { type: String, default: 'Tu destino de lujo hoy.' },
  heroDescription: { type: String, default: 'Participa por autos deportivos, motos de alta cilindrada y la última tecnología. Transparencia total y seguridad garantizada en cada sorteo.' },
  heroButtonText: { type: String, default: 'EMPEZAR A GANAR' },
  sponsorsTitle: { type: String, default: 'Nuestros Sponsors' },
  sponsors: { type: [String], default: [] },
  sponsorRotationInterval: { type: Number, default: 10000 }, // interval in ms
  activeRafflesTitle: { type: String, default: 'Sorteos Activos' },
  activeRafflesSubtitle: { type: String, default: 'Seleccioná tu premio, elegí tus chances y participá por el estilo de vida que merecés.' },
  footerDescription: { type: String, default: 'La plataforma premium de sorteos online. Llevando la emoción de ganar los mejores premios a cada rincón de Argentina.' },
  contactEmail: { type: String, default: 'contacto@sortealo.com.ar' },
  contactPhone: { type: String, default: '+54 11 1234-5678' },
  contactAddress: { type: String, default: 'Buenos Aires, Argentina' },
  // Email templates for winner notification and purchase confirmation
  winnerEmailSubject: { type: String, default: '¡Felicidades, {{name}}! Has ganado en {{raffleName}}' },
  winnerEmailBody: { type: String, default: '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; background-color: #ffffff;"><h1 style="color: #2563eb;">¡Felicidades, {{name}}!</h1><p>Has ganado el sorteo <strong>{{raffleName}}</strong> con el ticket <strong>{{winnerTicket}}</strong>.</p></div>' },
  purchaseEmailSubject: { type: String, default: 'Tus números para el sorteo: {{raffleName}}' },
  purchaseEmailBody: { type: String, default: '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; background-color: #ffffff;"><h1 style="color: #2563eb;">¡Mucha suerte, {{name}}!</h1><p>Has adquirido {{quantity}} chances.</p><div>{{ticketsHtml}}</div></div>' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
