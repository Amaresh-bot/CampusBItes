import { Schema, model, Document, Types } from 'mongoose';

export interface IStockLog extends Document {
  menuItemId: Types.ObjectId;
  itemName: string;
  previousStock: number;
  newStock: number;
  adminId: Types.ObjectId;
  adminName: string;
  createdAt: Date;
}

const stockLogSchema = new Schema<IStockLog>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    itemName: { type: String, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true }
  },
  { timestamps: true }
);

export const StockLog = model<IStockLog>('StockLog', stockLogSchema);
