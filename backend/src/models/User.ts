import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  fullName: string;
  rollNumber?: string;
  branch?: string;
  academicYear?: string;
  phoneNumber?: string;
  collegeId?: Types.ObjectId;
  role: 'customer' | 'admin';
  isVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    rollNumber: { type: String, unique: true, sparse: true, default: undefined, uppercase: true, trim: true },
    branch: { type: String, default: undefined, trim: true },
    academicYear: { type: String, default: undefined, trim: true },
    phoneNumber: { type: String, default: undefined, trim: true },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', default: undefined },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, default: undefined }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
