import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  customInstructions?: string;
}

export interface IStatusHistory {
  status: string;
  updatedAt: Date;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  statusHistory: IStatusHistory[];
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  tokenNumber?: string;
  mealCategory?: string;
  tokenSequence?: number;
  scheduledDate?: string;
  estimatedReadyAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  customInstructions: { type: String }
}, { _id: false });

const statusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'], 
      default: 'Pending' 
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'Pending' },
    paymentId: { type: String },
    tokenNumber: { type: String },
    mealCategory: { type: String },
    tokenSequence: { type: Number },
    scheduledDate: { type: String },
    estimatedReadyAt: { type: String }
  },
  { timestamps: true }
);

// Pre-save hook to automatically push status to history on update
orderSchema.pre('save', function (next: any) {
  if (this.isModified('status') || this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  next();
});

// Indexes for rapid lookups and order tracking screens
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });

export const Order = model<IOrder>('Order', orderSchema);
