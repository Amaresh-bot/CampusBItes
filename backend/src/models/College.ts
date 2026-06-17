import { Schema, model, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true }
  },
  { timestamps: true }
);

export const College = model<ICollege>('College', collegeSchema);
