import mongoose, { Document, Schema, Model } from "mongoose";
import { ICategory } from "./category";

const variantSchema: Schema = new Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
  sku: { type: String, required: true },
});

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    cost_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    images: { type: [String], required: true },
    variants: { type: [variantSchema], required: true },
    initialStock: { type: Number, required: true },
    addedStocks: [
      {
        quantity: { type: Number, required: true },
        date: { type: Date, required: true, default: Date.now },
      },
    ],
    availableQuantity: { type: Number, required: true, default: 0 },
    soldQuantity: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export interface IVariant extends Document {
  size: string;
  color: string;
  quantity: number;
  sku: string;
}

export interface IAddedStock {
  quantity: number;
  date: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: ICategory["_id"];
  cost_price: number;
  selling_price: number;
  images: string[];
  variants: IVariant[];
  initialStock: number;
  addedStocks: IAddedStock[];
  availableQuantity: number;
  soldQuantity: number;
}

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
