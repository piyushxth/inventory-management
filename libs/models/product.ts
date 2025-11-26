// import mongoose, { Document, Schema, Model } from "mongoose";
// import { ICategory } from "./category";

// const variantSchema: Schema = new Schema({
//   size: { type: String, required: true },
//   color: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   sku: { type: String, required: true },
// });

// const productSchema: Schema = new Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
//     cost_price: { type: Number, required: true },
//     selling_price: { type: Number, required: true },
//     images: { type: [String], required: true },
//     variants: { type: [variantSchema], required: true },
//     initialStock: { type: Number, required: true },
//     addedStocks: [
//       {
//         quantity: { type: Number, required: true },
//         date: { type: Date, required: true, default: Date.now },
//       },
//     ],
//     availableQuantity: { type: Number, required: true, default: 0 },
//     soldQuantity: { type: Number, required: true, default: 0 },
//   },
//   { timestamps: true }
// );

// export interface IVariant extends Document {
//   size: string;
//   color: string;
//   quantity: number;
//   sku: string;
// }

// export interface IAddedStock {
//   quantity: number;
//   date: Date;
// }

// export interface IProduct extends Document {
//   name: string;
//   description: string;
//   category: ICategory["_id"];
//   cost_price: number;
//   selling_price: number;
//   images: string[];
//   variants: IVariant[];
//   initialStock: number;
//   addedStocks: IAddedStock[];
//   availableQuantity: number;
//   soldQuantity: number;
// }

// export const Product: Model<IProduct> =
//   mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

import mongoose, { Document, Schema, Model } from "mongoose";
import { ICategory } from "./category";

// Define interfaces that match the Zod schema
interface ISizeOption {
  size: string;
  price: number;
  quantity: number;
  sku: string;
}

interface IVariant {
  color: string;
  colorHex: string;
  images: string[];
  options: ISizeOption[];
}

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
  availableQuantity: number;
  soldQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const sizeOptionSchema = new Schema<ISizeOption>(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    sku: { type: String, required: true },
  },
  { _id: false }
);

const variantSchema = new Schema<IVariant>(
  {
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    images: [{ type: String, required: true }],
    options: { type: [sizeOptionSchema], required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    costPrice: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    mainImage: { type: [String], required: true },
    tags: [{ type: String }],
    variants: { type: [variantSchema], required: true },
    availableQuantity: { type: Number, required: true },
    soldQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
