import mongoose, { Document, Schema, Model } from "mongoose";
import { ICategory } from "./category";
import { IVariant } from "./variant"; // Import the Variant interface

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
  // Variants are populated objects, not just string references
  variants: IVariant[];
  createdAt: Date;
  updatedAt: Date;
}

// Updated product interface without embedded variants
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  category: ICategory["_id"];
  costPrice: number;
  basePrice: number;
  mainImage: string[];
  tags?: string[];
  // Variants can be either string references or populated objects
  variants: string[]; // Removed reference to IVariant to avoid circular dependency
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
    // Reference to variants instead of embedding them
    variants: [{ type: Schema.Types.ObjectId, ref: "Variant" }],
  },
  { timestamps: true },
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
