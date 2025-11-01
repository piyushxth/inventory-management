// import { z } from "zod";

// export const variantSchema = z.object({
//   size: z.string().min(1, "Size is required"),
//   color: z.string().min(1, "Color is required"),
//   quantity: z.number().min(0, "Quantity is required"),
//   sku: z.string().min(1, "SKU is required"),
// });

// export const productCreateSchema = z.object({
//   _id: z.string().optional(), //s
//   name: z.string().min(1, "Name is required"),
//   description: z.string().min(1, "Description is required"),
//   category: z.string().min(1, "Category is required"), // category id as string
//   cost_price: z.number().min(0, "Cost price is required"),
//   selling_price: z.number().min(0, "Selling price is required"),
//   images: z.array(z.string()).min(1, "At least one image is required"),
//   variants: z.array(variantSchema).min(1, "At least one variant is required"),
//   availableQuantity: z.number().min(0, "Available quantity is required"),
//   initialStock: z.number().min(0, "Initial stock is required"),
// });

// export type TProductCreate = z.infer<typeof productCreateSchema>;
import { z } from "zod";

// 👕 Size-level option (inside each color variant)
export const sizeOptionSchema = z.object({
  size: z.string().min(1, "Size is required"),
  price: z.number().min(0, "Price is required"),
  quantity: z.number().min(0, "Quantity is required"),
  sku: z.string().min(1, "SKU is required"),
});

// 🎨 Variant-level (e.g. color + images + sizes)
export const variantSchema = z.object({
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().min(1, "Color hex is required"),
  
  images: z.array(z.string()).min(1, "At least one image is required"),
  options: z
    .array(sizeOptionSchema)
    .min(1, "At least one size option is required"),
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
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  availableQuantity: z.number().min(0, "Available quantity is required"),
  soldQuantity: z.number().min(0).default(0),
});

export type TProductCreate = z.infer<typeof productCreateSchema>;


export type ProductFormValues = {
  _id?: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  basePrice: number;
  mainImage: string[];
  tags?: string[];
  variants: {
    color: string;
    colorHex: string;
    
    images: string[];
    options: {
      size: string;
      price: number;
      quantity: number;
      sku: string;
    }[];
  }[];
  availableQuantity: number;
  soldQuantity: number;
};
