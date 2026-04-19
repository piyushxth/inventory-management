import { z } from "zod";

// 👕 Size-level option (inside each color variant)
export const sizeOptionSchema = z.object({
  size: z.string().min(1, "Size is required"),
  price: z.number().min(0, "Price is required"),
  quantity: z.number().min(0, "Quantity is required"),
  sku: z.string().min(1, "SKU is required"),
});

// 🎨 Variant schema
export const variantSchema = z.object({
  _id: z.string().optional(),
  product: z.string().min(1, "Product ID is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().min(1, "Color hex is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  options: z
    .array(sizeOptionSchema)
    .min(1, "At least one size option is required"),
  availableQuantity: z.number().min(0, "Available quantity is required"),
  soldQuantity: z.number().min(0).default(0),
});

export type TVariant = z.infer<typeof variantSchema>;