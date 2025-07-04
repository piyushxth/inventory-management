import mongoose, { Document, Schema, Model } from "mongoose";

const brandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String }, // URL or path to logo image
    description: { type: String },
  },
  { timestamps: true }
);

export interface IBrand extends Document {
  name: string;
  logo?: string;
  description?: string;
}

export const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", brandSchema);
