import mongoose, { Document, Schema, Model, Types } from "mongoose";

const cartItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: Schema.Types.ObjectId, required: false }, // Optional: for size/color
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema: Schema = new Schema(
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

export interface ICartItem extends Document {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
