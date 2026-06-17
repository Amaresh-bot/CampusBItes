import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  description?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  }
);

transactionSchema.index({ userId: 1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
