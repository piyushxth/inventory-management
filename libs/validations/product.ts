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

export const VariantSchema = z.object({
  id: z.string().optional(),

  colorId: z.string().min(1, "Color required"),
  sizeId: z.string().min(1, "Size required"),

  sku: z.string().min(1, "SKU required"),

  price: z.number().min(0, "Price must be >= 0"),

  salePrice: z.number().nullable().optional(),

  inStock: z.number().min(0, "Stock must be >= 0"),

  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().min(1),
        isPrimary: z.boolean(),
        sortOrder: z.number(),
      }),
    )
    .optional(),
});

export const ProductVariantsSchema = z.object({
  productId: z.string(),
  variants: z.array(VariantSchema).min(1, "At least one variant required"),
});
