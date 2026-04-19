import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { IProduct } from "./product";

// Define the size option interface
export interface ISizeOption {
  size: string;
  price: number;
  quantity: number;
  sku: string;
}

// Define the variant interface
export interface IVariant extends Document {
  _id: string;

  color: string;
  colorHex: string;
  images: string[];
  options: ISizeOption[];

  createdAt: Date;
  updatedAt: Date;
}

// Define the size option schema
export const sizeOptionSchema = new Schema<ISizeOption>(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    sku: { type: String, required: true },
  },
  { _id: false },
);

// Define the variant schema
const variantSchema = new Schema<IVariant>(
  {
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    images: [{ type: String, required: true }],
    options: { type: [sizeOptionSchema], required: true },
  },
  { timestamps: true },
);

export const Variant: Model<IVariant> =
  mongoose.models.Variant || mongoose.model<IVariant>("Variant", variantSchema);
