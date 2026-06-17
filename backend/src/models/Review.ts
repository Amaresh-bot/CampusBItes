import { Schema, model, Document, Types } from 'mongoose';
import { MenuItem } from './MenuItem';

export interface IReview extends Document {
  userId: Types.ObjectId;
  menuItemId: Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true }
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ menuItemId: 1 });
reviewSchema.index({ userId: 1 });

// Post-save hook to calculate and update average rating in MenuItem
reviewSchema.post('save', async function (doc) {
  const ReviewModel = doc.constructor as any;
  const stats = await ReviewModel.aggregate([
    { $match: { menuItemId: doc.menuItemId } },
    { $group: { _id: '$menuItemId', avgRating: { $avg: '$rating' } } }
  ]);
  
  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(doc.menuItemId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1))
    });
  }
});

export const Review = model<IReview>('Review', reviewSchema);
