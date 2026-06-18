import { Schema, model, Document } from 'mongoose';

export interface ICounter extends Document {
  key: string;       // Format: "token_<category>_<YYYY-MM-DD>"
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const counterSchema = new Schema<ICounter>(
  {
    key: { type: String, required: true, unique: true },
    sequence: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export const Counter = model<ICounter>('Counter', counterSchema);
