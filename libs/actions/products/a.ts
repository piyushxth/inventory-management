"use server";

import connectMongoDB from "@/libs/connnectMongoDB";

import { Product, ProductVariant, ProductImage } from "@/libs/models";

import { revalidatePath } from "next/cache";

import { z } from "zod";

// ======================================================
// SCHEMA
// ======================================================

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),

  description: z.string().min(1),

  isOnSale: z.boolean(),

  categoryId: z.string().min(1),
  genderId: z.string().min(1),

  variants: z
    .array(
      z.object({
        colorId: z.string().min(1),

        sizeId: z.string().min(1),

        sku: z.string().min(1),

        price: z.number().min(0),

        salePrice: z.number().nullable().optional(),

        inStock: z.number().min(0),

        images: z.array(
          z.object({
            url: z.string().min(1),

            isPrimary: z.boolean(),

            sortOrder: z.number(),
          }),
        ),
      }),
    )
    .min(1),
});

// ======================================================
// TYPES
// ======================================================

type Payload = z.infer<typeof createProductSchema>;

// ======================================================
// ACTION
// ======================================================

export async function createProductWithVariants(payload: Payload) {
  await connectMongoDB();

  // ======================================================
  // VALIDATION
  // ======================================================

  const parsed = createProductSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,

      error: parsed.error.flatten(),
    };
  }

  const data = parsed.data;

  // ======================================================
  // CREATE PRODUCT
  // ======================================================

  const createdProduct = await Product.create({
    name: data.name,

    slug: data.slug,

    description: data.description,

    isOnSale: data.isOnSale,

    categoryId: data.categoryId,

    genderId: data.genderId,
  });

  // ======================================================
  // CREATE VARIANTS + IMAGES
  // ======================================================

  for (const variant of data.variants) {
    // -----------------------------------
    // CREATE VARIANT
    // -----------------------------------

    const createdVariant = await ProductVariant.create({
      productId: createdProduct._id,

      colorId: variant.colorId,

      sizeId: variant.sizeId,

      sku: variant.sku,

      price: variant.price,

      salePrice: variant.salePrice ?? null,

      inStock: variant.inStock,
    });

    // -----------------------------------
    // CREATE IMAGES
    // -----------------------------------

    if (variant.images.length > 0) {
      const imagePayload = variant.images.map((image) => ({
        productId: createdProduct._id,

        variantId: createdVariant._id,

        url: image.url,

        isPrimary: image.isPrimary,

        sortOrder: image.sortOrder,
      }));

      await ProductImage.insertMany(imagePayload);
    }
  }

  // ======================================================
  // REVALIDATE
  // ======================================================

  revalidatePath("/admin/products");

  // ======================================================
  // RESPONSE
  // ======================================================

  return {
    success: true,

    productId: createdProduct._id.toString(),
  };
}
