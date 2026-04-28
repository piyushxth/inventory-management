"use server";

import { Product, ProductImage, ProductVariant } from "@/libs/models";
import mongoose from "mongoose";

type VariantInput = {
  _id?: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  colorId: string;
  sizeId: string;
  inStock: number;
};

type ImageInput = {
  _id?: string;
  url: string;
  variantId?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

type ProductInput = {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  genderId: string;
  isPublished?: boolean;
  variants?: VariantInput[];
  images?: ImageInput[];
};

// 🔹 CREATE PRODUCT
export async function createProduct(data: ProductInput) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Create product
    const product = await Product.create(
      [
        {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          genderId: data.genderId,
          isPublished: data.isPublished ?? true,
        },
      ],
      { session },
    );

    const productId = product[0]._id;

    // 2. Create variants
    if (data.variants?.length) {
      await ProductVariant.insertMany(
        data.variants.map((v) => ({
          ...v,
          productId,
        })),
        { session },
      );
    }

    // 3. Create images
    if (data.images?.length) {
      await ProductImage.insertMany(
        data.images.map((img) => ({
          ...img,
          productId,
        })),
        { session },
      );
    }

    await session.commitTransaction();
    return product[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// 🔹 UPDATE PRODUCT (with variants + images)
export async function updateProduct(productId: string, data: ProductInput) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Update main product
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          genderId: data.genderId,
          isPublished: data.isPublished,
        },
      },
    ).session(session);

    // 2. Replace variants (simple strategy)
    if (data.variants) {
      await ProductVariant.deleteMany({ productId }).session(session);

      await ProductVariant.insertMany(
        data.variants.map((v) => ({
          ...v,
          productId,
        })),
        { session },
      );
    }

    // 3. Replace images
    if (data.images) {
      await ProductImage.deleteMany({ productId }).session(session);

      await ProductImage.insertMany(
        data.images.map((img) => ({
          ...img,
          productId,
        })),
        { session },
      );
    }

    await session.commitTransaction();

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// 🔹 DELETE PRODUCT (with cleanup)
export async function deleteProduct(productId: string) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Product.deleteOne({ _id: productId }).session(session);
    await ProductVariant.deleteMany({ productId }).session(session);
    await ProductImage.deleteMany({ productId }).session(session);

    await session.commitTransaction();

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
