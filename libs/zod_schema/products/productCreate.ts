import { z } from "zod";

// 👕 Size-level option (inside each color variant)
export const sizeOptionSchema = z.object({
  size: z.string().min(1, "Size is required"),
  price: z.number().min(0, "Price is required"),
  quantity: z.number().min(0, "Quantity is required"),
  sku: z.string().min(1, "SKU is required"),
});

// 🎨 Color variant schema with embedded options
export const colorVariantSchema = z.object({
  color: z.string().min(1, "Color is required"),
  colorHex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color hex must be a valid hex color")
    .default("#000000"),
  images: z.array(z.string()).default([]),
  options: z.array(sizeOptionSchema).min(1, "At least one option is required"),
});

// 🛍️ Main Product schema
export const productCreateSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  costPrice: z.number().min(0, "Cost price is required"),
  basePrice: z.number().min(0, "Base price is required"),
  mainImage: z.array(z.string()).min(1, "At least one image is required"),
  tags: z.array(z.string()).optional(),
  variants: z
    .array(colorVariantSchema)
    .min(1, "At least one variant is required"),
});

export type TProductCreate = z.infer<typeof productCreateSchema>;

// Alias kept for existing imports (admin form).
export type ProductFormValues = TProductCreate;
