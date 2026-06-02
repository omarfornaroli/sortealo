
import mongoose, { Schema, Document } from 'mongoose';

export interface IRaffle extends Document {
  name: string;
  description: string;
  imageUrl: string;
  participants: string[];
  isFinished: boolean;
}

const RaffleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  participants: [{ type: String }],
  isFinished: { type: Boolean, default: false },
});

export default mongoose.models.Raffle || mongoose.model<IRaffle>('Raffle', RaffleSchema);
