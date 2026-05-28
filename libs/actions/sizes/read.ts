"use server";

import connectMongoDB from "@/libs/connnectMongoDB";
import { Size } from "@/libs/models";

export async function getSizes() {
  await connectMongoDB();

  const sizes = await Size.find().sort({ name: 1 }).lean();

  return sizes.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    slug: s.slug,
    sortOrder: s.sortOrder,
    createdAt: s.createdAt?.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
  }));
}
