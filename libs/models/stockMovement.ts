import mongoose, { Document, Schema, Model, Types } from "mongoose";

const stockMovementSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true }, // + for in, - for out
  type: {
    type: String,
    enum: ["purchase", "sale", "return", "adjustment"],
    required: true,
  },
  note: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export interface IStockMovement extends Document {
  product: Types.ObjectId;
  quantity: number;
  type: "purchase" | "sale" | "return" | "adjustment";
  note?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

export const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", stockMovementSchema);
