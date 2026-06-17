import { Schema, model, Document, Types } from 'mongoose';

export interface IPrintItem {
  fileName: string;
  fileUrl?: string;
  pages: number;
  copies: number;
  colorType: 'bw' | 'color';
  printLayout: 'oneside' | 'twoside';
  price: number;
}

export interface IPrintOrder extends Document {
  userId: Types.ObjectId;
  studentName: string;
  rollNumber: string;
  department?: string;
  contactNumber: string;
  pickupTimeSlot?: string;
  items: IPrintItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'APPROVED' | 'PRINTING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  upiUtr?: string;
  upiScreenshot?: string;
  upiApp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const printItemSchema = new Schema<IPrintItem>({
  fileName: { type: String, required: true },
  fileUrl: { type: String },
  pages: { type: Number, required: true, min: 1 },
  copies: { type: Number, required: true, min: 1 },
  colorType: { type: String, enum: ['bw', 'color'], required: true },
  printLayout: { type: String, enum: ['oneside', 'twoside'], required: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const printOrderSchema = new Schema<IPrintOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, uppercase: true, trim: true },
    department: { type: String, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    pickupTimeSlot: { type: String, trim: true },
    items: { type: [printItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'PRINTING', 'READY', 'COMPLETED', 'CANCELLED'], 
      default: 'PENDING' 
    },
    upiUtr: { type: String, trim: true },
    upiScreenshot: { type: String, trim: true },
    upiApp: { type: String, trim: true }
  },
  { timestamps: true }
);

printOrderSchema.index({ userId: 1 });

export const PrintOrder = model<IPrintOrder>('PrintOrder', printOrderSchema);
