import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { ICategory } from "./category";
import { IVariant } from "./variant";

// Interface for populated product with actual variant objects
export interface IPopulatedProduct extends Document {
  _id: string;
  name: string;
  description: string;
  category: ICategory["_id"];
  costPrice: number;
  basePrice: number;
  mainImage: string[];
  tags?: string[];
  variants: IVariant[];
  createdAt: Date;
  updatedAt: Date;
}

// Product document used in the client tree. In practice every query that
// returns products to the UI calls `.populate("variants")`, so we keep the
// common case (`IVariant[]`) here so components don't need casts. Server
// code that operates on unpopulated variants should use Types.ObjectId lists
// directly from the Mongoose document.
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  category: ICategory["_id"];
  costPrice: number;
  basePrice: number;
  mainImage: string[];
  tags?: string[];
  variants: IVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    costPrice: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    mainImage: { type: [String], required: true },
    tags: [{ type: String }],
    variants: [{ type: Schema.Types.ObjectId, ref: "Variant" }],
  },
  { timestamps: true },
);

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", productSchema);
