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
  colorHex: z.string().default(""),
  images: z.array(z.string()).default([]),
  options: z.array(sizeOptionSchema).min(1, "At least one option is required"),
});

// 🛍️ Main Product schema
export const productCreateSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"), // category ObjectId as string
  costPrice: z.number().min(0, "Cost price is required"),
  basePrice: z.number().min(0, "Base price is required"),
  mainImage: z.array(z.string()).min(1, "At least one image is required"),
  tags: z.array(z.string()).optional(),
  // Embedded variants with color and options
  variants: z
    .array(colorVariantSchema)
    .min(1, "At least one variant is required"),
});

export type TProductCreate = z.infer<typeof productCreateSchema>;

// export type ProductFormValues = {
//   _id?: string;
//   name: string;
//   description: string;
//   category: string;
//   costPrice: number;
//   basePrice: number;
//   mainImage: string[];
//   tags?: string[];
//   // Embedded variants with color and options
//   variants: Array<{
//     color: string;
//     colorHex: string;
//     images: string[];
//     options: Array<{
//       size: string;
//       price: number;
//       quantity: number;
//       sku: string;
//     }>;
//   }>;
//   availableQuantity: number;
//   soldQuantity: number;
// };
