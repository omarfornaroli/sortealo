
import mongoose, { Schema, Document } from 'mongoose';

export interface IWinner extends Document {
  raffleTitle: string;
  winnerName: string;
  ticketNumber: string;
  date: Date;
  image: string;
}

const WinnerSchema: Schema = new Schema({
  raffleTitle: { type: String, required: true },
  winnerName: { type: String, required: true },
  ticketNumber: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String, required: true },
});

export default mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema);
