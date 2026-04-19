import { z } from "zod";

export const OrderItemRetrieveSchema = z.object({
  product: z.any(),
  productName: z.string().optional(),
  productImage: z.string().optional(),
  variant: z.any().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
});

const addressSchema = z.object({
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
});

export const OrderRetrieveSchema = z.object({
  _id: z.string().optional(),
  user: z.any().optional(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  items: z.array(OrderItemRetrieveSchema),
  subtotal: z.number().optional(),
  shippingFee: z.number().optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
  totalAmount: z.number(),
  currency: z.string().optional(),
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Dispatched",
    "Delivered",
    "Cancelled",
    "Returned",
  ]),
  paymentStatus: z.enum(["Paid", "Unpaid", "Refunded", "Failed"]),
  paymentMethod: z.enum(["COD", "Online", "Esewa"]),
  paymentRefId: z.string().optional(),
  orderNote: z.string().optional(),
  createdDate: z.union([z.string(), z.date()]),
  modifiedDate: z.union([z.string(), z.date()]),
});

export type TOrderRetrieve = z.infer<typeof OrderRetrieveSchema>;
