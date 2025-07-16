import { z } from "zod";

export const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  quantity: z.number().min(0, "Quantity is required"),
  sku: z.string().min(1, "SKU is required"),
});

export const productCreateSchema = z.object({
  _id: z.string().optional(), //s
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"), // category id as string
  cost_price: z.number().min(0, "Cost price is required"),
  selling_price: z.number().min(0, "Selling price is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  availableQuantity: z.number().min(0, "Available quantity is required"),
  initialStock: z.number().min(0, "Initial stock is required"),
});

export type TProductCreate = z.infer<typeof productCreateSchema>;
