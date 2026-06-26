import { Schema, model, Document, Types } from 'mongoose';

export interface ICanteen extends Document {
  collegeId: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  isTemporarilyClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const canteenSchema = new Schema<ICanteen>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    openingTime: { type: String, default: "08:00" },
    closingTime: { type: String, default: "20:00" },
    isTemporarilyClosed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index canteen lookups per college for faster searches
canteenSchema.index({ collegeId: 1 });

export const Canteen = model<ICanteen>('Canteen', canteenSchema);
