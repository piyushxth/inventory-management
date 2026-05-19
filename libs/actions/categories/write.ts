"use server";

import { revalidatePath } from "next/cache";
import {
  CategoryCreateInput,
  CategoryCreateSchema,
  categorySchema,
} from "@/libs/validations/category";
import { Category } from "@/libs/models/Category";
import { CategoryType } from "@/libs/products.types";

export async function updateCategory(data: CategoryType) {
  const parsed = categorySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }
  if (parsed.success) {
    console.log("Parsed Data:", parsed.data);
  }

  const { id, name, slug } = parsed.data;

  const awaits = await Category.findByIdAndUpdate(id, {
    name,
    slug,
  });
  console.log("Database Update Result:", awaits);
  // refresh admin list page
  revalidatePath("/admin/categories");

  return { success: true };
}

export async function createCategory(data: CategoryCreateInput) {
  const parsed = CategoryCreateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  const { name, slug, parentId } = parsed.data;

  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    return {
      success: false,
      error: {
        name: ["Category already exists"],
      },
    };
  }

  const newCategory = await Category.create({
    name,
    slug,
    parentId: parentId || null,
  });

  revalidatePath("/admin/categories");

  return {
    success: true,
    data: {
      id: newCategory._id.toString(),
      name: newCategory.name,
      slug: newCategory.slug,
      createdAt: newCategory.createdAt,
    },
  };
}
