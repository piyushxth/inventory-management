import { z } from "zod";

export const OrderItemRetrieveSchema = z.object({
  product: z.any(), // Can be ObjectId or populated product object
  quantity: z.number(),
  price: z.number(),
});

export const OrderRetrieveSchema = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    province: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
  }),
  items: z.array(OrderItemRetrieveSchema),
  totalAmount: z.number(),
  discount: z.number().optional(),
  additionalPrice: z.number().optional(),
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Dispatched",
    "Delivered",
    "Cancelled",
    "Returned",
  ]),
  paymentStatus: z.enum(["Paid", "Unpaid", "Refunded"]),
  paymentMethod: z.enum(["COD", "Online"]),
  orderNote: z.string().optional(),
  createdDate: z.union([z.string(), z.date()]),
  modifiedDate: z.union([z.string(), z.date()]),
});

export type TOrderRetrieve = z.infer<typeof OrderRetrieveSchema>;
