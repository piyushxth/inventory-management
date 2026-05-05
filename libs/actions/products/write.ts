"use server";

import { Product } from "@/libs/models/Product";
import { revalidatePath } from "next/cache";
import { productGeneralSchema } from "@/libs/validations/product";

export async function updateProductGeneral(data: unknown) {
  const parsed = productGeneralSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }
  if (parsed.success) {
    console.log("Parsed Data:", parsed.data);
  }

  const { id, name, slug, description, isOnSale, categoryId, genderId } =
    parsed.data;

  const awaits = await Product.findByIdAndUpdate(id, {
    name,
    slug,
    description,
    isOnSale,
    categoryId,
    genderId,
  });
  console.log("Database Update Result:", awaits);
  // refresh admin list page
  revalidatePath("/admin/products");

  return { success: true };
}
