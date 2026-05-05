import { z } from "zod";

export const productGeneralSchema = z.object({
  id: z.string().min(1, "Product ID is required"),

  name: z.string().min(1, "Name is required").max(200, "Name too long"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, no spaces"),

  description: z.string().max(4000).default(""),

  isOnSale: z.boolean(),

  categoryId: z.string().min(1, "Category is required"),
  genderId: z.string().min(1, "Gender is required"),
});

export const VariantImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
});

export const VariantSchema = z.object({
  id: z.string().optional(),

  colorId: z.string().nullable(),
  sizeId: z.string().nullable(),

  sku: z.string().min(1),
  price: z.number().min(0),
  salePrice: z.number().nullable().optional(),
  inStock: z.number().min(0),

  images: z.array(VariantImageSchema),
});

export const ProductVariantsModalSchema = z.object({
  productId: z.string(),

  colorIds: z.array(z.string()),
  sizeIds: z.array(z.string()),

  variants: z.array(VariantSchema),
});
