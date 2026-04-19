import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Define the cart item schema
const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: Schema.Types.ObjectId, ref: "Variant", required: false },
  size: { 
    size: { type: String, required: false },
    price: { type: Number, required: false },
    quantity: { type: Number, required: false },
    sku: { type: String, required: false }
  },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [cartItemSchema], required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface ISizeInfo {
  size?: string;
  price?: number;
  quantity?: number;
  sku?: string;
}

export interface ICartItem extends Document {
  product: Types.ObjectId;
  variant?: Types.ObjectId; // Reference to Variant model
  size?: ISizeInfo;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);