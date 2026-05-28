import { fetchFilterOptions } from "@/libs/repositories/filter.repo";
import { ProductFilterOptions } from "../products.types";

export async function getFilterOptionsService(): Promise<ProductFilterOptions> {
  const { genders, categories, colors, sizes } = await fetchFilterOptions();

  // 🔥 build lookup map
  const catById = new Map(
    categories.map((c: any) => [String(c._id), c.slug as string]),
  );

  return {
    genders: genders.map((g: any) => ({
      label: g.label,
      slug: g.slug,
    })),

    categories: categories.map((c: any) => ({
      name: c.name,
      slug: c.slug,
      parentSlug: c.parentId ? (catById.get(String(c.parentId)) ?? null) : null,
    })),

    colors: colors.map((c: any) => ({
      name: c.name,
      slug: c.slug,
      hexCode: c.hexCode,
    })),

    sizes: sizes.map((s: any) => ({
      name: s.name,
      slug: s.slug,
      sortOrder: s.sortOrder,
    })),
  };
}
