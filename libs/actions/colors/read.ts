"use server";

import connectMongoDB from "@/libs/connnectMongoDB";
import { Color } from "@/libs/models";

export async function getColors() {
  await connectMongoDB();

  const colors = await Color.find().sort({ name: 1 }).lean();

  return colors.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    hexCode: c.hexCode,
    createdAt: c.createdAt?.toISOString(),
    updatedAt: c.updatedAt?.toISOString(),
  }));
}
