import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  fullName: string;
  rollNumber: string;
  branch?: string;
  academicYear?: string;
  phoneNumber?: string;
  collegeId?: Types.ObjectId;
  role: 'customer' | 'admin';
  profileLocked: boolean;
  isVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    branch: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    profileLocked: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String }
  },
  { timestamps: true }
);


export const User = model<IUser>('User', userSchema);
