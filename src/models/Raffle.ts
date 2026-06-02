
import mongoose, { Schema, Document } from 'mongoose';

export interface IRaffle extends Document {
  name: string;
  description: string;
  imageUrl: string;
  participants: string[];
  isFinished: boolean;
  ticketPrice: number;
  maxTickets: number;
  drawDate: Date;
  winnerEmail?: string;
  winnerTicket?: string;
}

const RaffleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  participants: [{ type: String }],
  isFinished: { type: Boolean, default: false },
  ticketPrice: { type: Number, default: 0 },
  maxTickets: { type: Number, default: 0 },
  drawDate: { type: Date, default: Date.now },
  winnerEmail: { type: String },
  winnerTicket: { type: String },
}, { timestamps: true });

export default mongoose.models.Raffle || mongoose.model<IRaffle>('Raffle', RaffleSchema);
