import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  canteenId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  estimatedPrepTime: number;
  rating: number;
  availableStock: number;
  batchSize: number;
  cookTime: number;
  tags: string[];
  isTodaySpecial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    canteenId: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    estimatedPrepTime: { type: Number, default: 10 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    availableStock: { type: Number, default: 50, min: 0 },
    batchSize: { type: Number, default: 2, min: 1 },
    cookTime: { type: Number, default: 10, min: 1 },
    tags: { type: [String], default: [] },
    isTodaySpecial: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Composite Index for category-based store filtering
menuItemSchema.index({ canteenId: 1, category: 1 });

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
