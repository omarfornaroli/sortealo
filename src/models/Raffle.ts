
import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
  email: string;
  name: string;
  dni: string;
  phone: string;
  tickets: string[];
  purchaseDate: Date;
  sellerId?: string;
  sellerName?: string;
}

export interface IRaffle extends Document {
  name: string;
  description: string;
  imageUrl?: string;
  participants: IParticipant[];
  isFinished: boolean;
  isFeatured: boolean;
  featuredTitleColor?: string;
  featuredSubtitleColor?: string;
  featuredBackgroundImageUrl?: string;
  ticketPrice: number;
  ticketOptions?: { quantity: number; price: number }[];
  maxTickets: number;
  soldTickets: number;
  drawDate: Date;
  winnerEmail?: string;
  winnerTicket?: string;
  // New field to support multiple prizes per raffle
  prizes?: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
  // New field to store winners for each prize, ordered by prize index
  prizeWinners?: {
    email: string;
    name: string;
    ticket: string;
  }[];
}

const ParticipantSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  dni: { type: String, required: true },
  phone: { type: String, required: true },
  tickets: [{ type: String }],
  purchaseDate: { type: Date, default: Date.now },
  sellerId: { type: String },
  sellerName: { type: String, default: 'Venta General' }
}, { _id: false });

const RaffleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  // The main prize image is now optional; individual prize images are stored in the `prizes` array.
  imageUrl: { type: String, required: false },
  participants: { type: [ParticipantSchema], default: [] },
  isFinished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  featuredTitleColor: { type: String, default: '#ffffff' },
  featuredSubtitleColor: { type: String, default: '#94a3b8' },
  featuredBackgroundImageUrl: { type: String },
  ticketPrice: { type: Number, default: 0 },
  ticketOptions: [{
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  maxTickets: { type: Number, default: 0 },
  soldTickets: { type: Number, default: 0 },
  drawDate: { type: Date, default: Date.now },
  winnerEmail: { type: String },
  winnerTicket: { type: String },
  // Array of prize objects allowing multiple prizes per raffle
  prizes: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
  }],
  // Array parallel to prizes storing the winner info for each prize
  prizeWinners: [{
    email: { type: String, required: true },
    name: { type: String, required: true },
    ticket: { type: String, required: true },
  }],
}, { timestamps: true });

export default mongoose.models.Raffle || mongoose.model<IRaffle>('Raffle', RaffleSchema);
