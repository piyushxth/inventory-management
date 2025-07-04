import mongoose, { Document, Schema, Model } from "mongoose";

const orderItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema: Schema = new Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String },
      city: { type: String },
      address: { type: String },
      landmark: { type: String },
    },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    additionalPrice: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Dispatched",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
    },
    paymentMethod: { type: String, enum: ["COD", "Online"] },
    orderNote: { type: String },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: "modifiedDate" } }
);

export interface IOrderItem extends Document {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customer: {
    name: string;
    email: string;
    phone: string;
    province?: string;
    city?: string;
    address?: string;
    landmark?: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  discount?: number;
  additionalPrice?: number;
  orderStatus:
    | "Pending"
    | "Processing"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  paymentMethod: "COD" | "Online";
  orderNote?: string;
  createdDate: Date;
  modifiedDate: Date;
}

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
