import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const OrderItemInputSchema = z.object({
  product: objectIdSchema,
  variant: objectIdSchema.optional(),
  size: z.string().min(1).optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

const addressInputSchema = z.object({
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  landmark: z.string().optional(),
});

export const OrderCreateSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(7, "Valid phone required"),
  }),
  shippingAddress: addressInputSchema,
  billingAddress: addressInputSchema.optional(),
  items: z.array(OrderItemInputSchema).min(1, "Cart is empty"),
  paymentMethod: z.enum(["COD", "Online", "Esewa"]),
  orderNote: z.string().optional(),
});

export type TOrderCreate = z.infer<typeof OrderCreateSchema>;
export type TOrderItemInput = z.infer<typeof OrderItemInputSchema>;
