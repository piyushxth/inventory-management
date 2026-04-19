import mongoose, { Document, Schema, Model, Types } from "mongoose";

const addressSchema = new Schema(
  {
    province: { type: String },
    city: { type: String },
    address: { type: String },
    landmark: { type: String },
  },
  { _id: false }
);

const orderItemSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    variant: { type: Schema.Types.ObjectId, ref: "Variant" },
    color: { type: String },
    colorHex: { type: String },
    size: { type: String },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
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
      enum: ["Paid", "Unpaid", "Refunded", "Failed"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "Esewa"],
      required: true,
    },
    paymentRefId: { type: String },
    orderNote: { type: String },
    stockDecremented: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: "modifiedDate" } }
);

export interface IOrderAddress {
  province?: string;
  city?: string;
  address?: string;
  landmark?: string;
}

export interface IOrderItem {
  product: Types.ObjectId | string;
  productName: string;
  productImage?: string;
  variant?: Types.ObjectId | string;
  color?: string;
  colorHex?: string;
  size?: string;
  sku?: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user?: Types.ObjectId;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  orderStatus:
    | "Pending"
    | "Processing"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  paymentStatus: "Paid" | "Unpaid" | "Refunded" | "Failed";
  paymentMethod: "COD" | "Online" | "Esewa";
  paymentRefId?: string;
  orderNote?: string;
  stockDecremented: boolean;
  createdDate: Date;
  modifiedDate: Date;
}

export const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);
