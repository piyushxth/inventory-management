"use server";

import { Category } from "@/libs/models";

export async function getCategories() {
  const categories = await Category.find().lean();

  return categories.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  }));
}
