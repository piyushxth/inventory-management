import mongoose, { Document, Schema, Model, Types } from "mongoose";

const addressSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    addressLine: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
    type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
  },
  { timestamps: true }
);

export interface IAddress extends Document {
  user: Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  addressLine: string;
  landmark?: string;
  isDefault: boolean;
  type: "shipping" | "billing";
}

export const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", addressSchema);
