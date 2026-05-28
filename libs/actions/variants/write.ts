"use server";

import connectMongoDB from "@/libs/connnectMongoDB";
import { ProductImage, ProductVariant } from "@/libs/models";
import mongoose from "mongoose";

type VariantImageInput = {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

type VariantInput = {
  id?: string;
  colorId: string;
  sizeId: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  inStock: number;
  images: VariantImageInput[];
};

type Payload = {
  productId: string;
  variants: VariantInput[];
};

export async function updateProductVariantsWithImages(payload: Payload) {
  await connectMongoDB();

  const { productId, variants } = payload;

  // -----------------------------------
  // EXISTING VARIANTS
  // -----------------------------------

  const existingVariants = await ProductVariant.find({
    productId,
  }).lean();

  const existingVariantIds = new Set(
    existingVariants.map((v) => String(v._id)),
  );

  const incomingVariantIds = new Set(
    variants.filter((v) => v.id).map((v) => String(v.id)),
  );

  // -----------------------------------
  // DELETE REMOVED VARIANTS
  // -----------------------------------

  const variantsToDelete = existingVariants.filter(
    (v) => !incomingVariantIds.has(String(v._id)),
  );

  if (variantsToDelete.length > 0) {
    const ids = variantsToDelete.map((v) => v._id);

    await ProductVariant.deleteMany({
      _id: { $in: ids },
    });

    await ProductImage.deleteMany({
      variantId: { $in: ids },
    });
  }

  // -----------------------------------
  // UPSERT VARIANTS
  // -----------------------------------

  for (const variant of variants) {
    let variantId: mongoose.Types.ObjectId;

    // -------------------------
    // UPDATE
    // -------------------------

    if (variant.id && existingVariantIds.has(variant.id)) {
      await ProductVariant.updateOne(
        { _id: variant.id },
        {
          $set: {
            sku: variant.sku,
            price: variant.price,
            salePrice: variant.salePrice ?? null,
            inStock: variant.inStock,
            colorId: variant.colorId,
            sizeId: variant.sizeId,
          },
        },
      );

      variantId = new mongoose.Types.ObjectId(variant.id);
    }

    // -------------------------
    // CREATE
    // -------------------------
    else {
      const created = await ProductVariant.create({
        productId,
        sku: variant.sku,
        price: variant.price,
        salePrice: variant.salePrice ?? null,
        inStock: variant.inStock,
        colorId: variant.colorId,
        sizeId: variant.sizeId,
      });

      variantId = created._id;
    }

    // =========================================
    // IMAGE SYNC
    // =========================================

    const existingImages = await ProductImage.find({
      variantId,
    }).lean();

    const existingImageIds = new Set(
      existingImages.map((img) => String(img._id)),
    );

    const incomingImageIds = new Set(
      variant.images.filter((img) => img.id).map((img) => String(img.id)),
    );

    // -----------------------------------
    // DELETE REMOVED IMAGES
    // -----------------------------------

    const imagesToDelete = existingImages.filter(
      (img) => !incomingImageIds.has(String(img._id)),
    );

    if (imagesToDelete.length > 0) {
      await ProductImage.deleteMany({
        _id: {
          $in: imagesToDelete.map((img) => img._id),
        },
      });
    }

    // -----------------------------------
    // UPSERT IMAGES
    // -----------------------------------

    for (const image of variant.images) {
      // UPDATE
      if (image.id && existingImageIds.has(image.id)) {
        await ProductImage.updateOne(
          { _id: image.id },
          {
            $set: {
              url: image.url,
              isPrimary: image.isPrimary,
              sortOrder: image.sortOrder,
            },
          },
        );
      }

      // CREATE
      else {
        await ProductImage.create({
          productId,
          variantId,
          url: image.url,
          isPrimary: image.isPrimary,
          sortOrder: image.sortOrder,
        });
      }
    }
  }

  return {
    success: true,
  };
}
