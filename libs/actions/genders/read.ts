"use server";

import { Gender } from "@/libs/models";

export async function getGenders() {
  const genders = await Gender.find().lean();

  return genders.map((g) => ({
    id: g._id.toString(),
    label: g.label,
    slug: g.slug,
  }));
}
