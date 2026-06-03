
import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
  email: string;
  name: string;
  phone: string;
  tickets: string[];
  purchaseDate: Date;
}

export interface IRaffle extends Document {
  name: string;
  description: string;
  imageUrl: string;
  participants: IParticipant[];
  isFinished: boolean;
  isFeatured: boolean;
  ticketPrice: number;
  maxTickets: number;
  soldTickets: number;
  drawDate: Date;
  winnerEmail?: string;
  winnerTicket?: string;
}

const ParticipantSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  tickets: [{ type: String }],
  purchaseDate: { type: Date, default: Date.now }
});

const RaffleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  participants: [ParticipantSchema],
  isFinished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  ticketPrice: { type: Number, default: 0 },
  maxTickets: { type: Number, default: 0 },
  soldTickets: { type: Number, default: 0 },
  drawDate: { type: Date, default: Date.now },
  winnerEmail: { type: String },
  winnerTicket: { type: String },
}, { timestamps: true });

export default mongoose.models.Raffle || mongoose.model<IRaffle>('Raffle', RaffleSchema);
