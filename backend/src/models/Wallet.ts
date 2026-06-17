import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  pinHash: string;
  isAutoTopupEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePIN(pin: string): Promise<boolean>;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0.0 },
    pinHash: { type: String, default: '' },
    isAutoTopupEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Hash the PIN before saving
walletSchema.pre('save', async function (next) {
  if (this.isModified('pinHash') && this.pinHash) {
    // If pinHash is provided as plain text pin in a creation/update, hash it here
    const salt = await bcrypt.genSalt(10);
    this.pinHash = await bcrypt.hash(this.pinHash, salt);
  } else if (!this.pinHash) {
    // default pin is '1234'
    const salt = await bcrypt.genSalt(10);
    this.pinHash = await bcrypt.hash('1234', salt);
  }
  next();
});

// Compare PIN helper
walletSchema.methods.comparePIN = async function (pin: string): Promise<boolean> {
  return bcrypt.compare(pin, this.pinHash);
};

walletSchema.index({ userId: 1 }, { unique: true });

export const Wallet = model<IWallet>('Wallet', walletSchema);
