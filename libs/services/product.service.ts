import mongoose from "mongoose";
import {
  aggregateProducts,
  findAdminProductsRepo,
  findProductBySlugRepo,
  findRecommendedProductsRepo,
} from "@/libs/repositories/product.repo";
import { Gender } from "@/libs/models/Gender";
import { Color } from "@/libs/models/Color";
import { Size } from "@/libs/models/Size";
import {
  AdminProductTableItem,
  ProductDetail,
  ProductDetailImage,
  ProductDetailVariant,
  ProductListItem,
  ProductQuery,
} from "../products.types";
import { Category } from "../models";

type Params = {
  type?: "related" | "trending";
  productId?: string;
  categoryId?: string;
  genderId?: string;
  limit?: number;
};

export async function listProductsService(
  query: ProductQuery,
): Promise<ProductListItem[]> {
  // 1. Convert slugs → ObjectIds
  const categorySlugs = query.categories ?? [];
  const genderSlugs = query.genders ?? [];
  const colorSlugs = query.colors ?? [];
  const sizeSlugs = query.sizes ?? [];
  const [categoryDocs, genderDocs, colorDocs, sizeDocs] = await Promise.all([
    categorySlugs.length
      ? Category.find({ slug: { $in: categorySlugs } }).select("_id")
      : [],
    genderSlugs.length
      ? Gender.find({ slug: { $in: genderSlugs } }).select("_id")
      : [],
    colorSlugs.length
      ? Color.find({ slug: { $in: colorSlugs } }).select("_id")
      : [],
    sizeSlugs.length
      ? Size.find({ slug: { $in: sizeSlugs } }).select("_id")
      : [],
  ]);

  const categoryIds = categoryDocs.map((c) => c._id);
  const genderIds = genderDocs.map((g) => g._id);
  const colorIds = colorDocs.map((c) => c._id);
  const sizeIds = sizeDocs.map((s) => s._id);

  // 2. Build match (product-level filters)

  const match: Record<string, unknown> = {
    isOnSale: true,
  };

  if (categoryIds.length) {
    match.categoryId = { $in: categoryIds };
  }

  if (genderIds.length) {
    match.genderId = { $in: genderIds };
  }

  // 3. Sort logic

  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  switch (query.sort) {
    case "price-asc":
      sort = { basePrice: 1 };
      break;
    case "price-desc":
      sort = { basePrice: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
  }

  // 4. Call repository (DB layer)

  const rawProducts = await aggregateProducts({
    match,
    colorIds,
    sizeIds,
    sort,
    limit: 24,
    skip: 0,
  });

  // 5. Transform → UI-friendly format

  const products: ProductListItem[] = rawProducts.map((p: any) => {
    const primaryImage = p.images?.[0]?.url ?? null;

    const price = p.basePrice ?? 0;

    return {
      id: String(p._id),
      name: p.name,
      slug: p.slug,

      category: p.category
        ? {
            name: p.category.name,
            slug: p.category.slug,
          }
        : { name: "", slug: "" },

      gender: p.gender
        ? {
            label: p.gender.label,
            slug: p.gender.slug,
          }
        : { label: "", slug: "" },

      price,
      salePrice: null, // you can enhance later
      isOnSale: false,

      primaryImageUrl: primaryImage,

      colors: [], // can enhance later if needed

      quickAddVariant: null, // optional feature
    };
  });
  console.log("Raw products from DB:", rawProducts);
  console.log("Transformed products for UI:", products);
  return products;
}

export async function getProductBySlugService(
  slug: string,
): Promise<ProductDetail | null> {
  if (!slug) return null;
  const product = await findProductBySlugRepo(slug);
  if (!product) return null;

  const rawVariants = (product.variants ?? []) as any[];
  const rawImages = (product.images ?? []) as any[];
  console.log(
    rawImages.map((img) => ({
      id: img._id,
      variantId: img.variantId,
    })),
  );

  // -------------------------
  // VARIANTS (STRICT TYPE)
  // -------------------------
  const variants: ProductDetailVariant[] = rawVariants.map((v) => {
    const variantId = String(v._id);

    const variantImages = rawImages
      .filter((img) => String(img.variantId) === variantId)
      .map((img) => ({
        id: String(img._id),
        url: img.url,
        variantId: img.variantId ? String(img.variantId) : null,
        colorSlug: v.colorId?.slug ?? null,
        sortOrder: img.sortOrder ?? 0,
        isPrimary: img.isPrimary ?? false,
      }));

    return {
      id: variantId,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice ?? null,
      inStock: v.inStock,

      color: {
        id: String(v.colorId?._id),
        name: v.colorId?.name ?? "",
        slug: v.colorId?.slug ?? "",
        hexCode: v.colorId?.hexCode ?? "",
      },

      size: {
        id: String(v.sizeId?._id),
        name: v.sizeId?.name ?? "",
        slug: v.sizeId?.slug ?? "",
        sortOrder: v.sizeId?.sortOrder ?? 0,
      },

      images: variantImages, // ✅ KEY FIX
    };
  });
  // -------------------------
  // IMAGE MAPPING (FIXED)
  // -------------------------
  const variantById = new Map(rawVariants.map((v) => [String(v._id), v]));

  const images: ProductDetailImage[] = rawImages.map((img) => {
    const variant = img.variantId
      ? variantById.get(String(img.variantId))
      : null;

    return {
      id: String(img._id),
      url: img.url,
      variantId: img.variantId ? String(img.variantId) : null,
      colorSlug: variant?.colorId?.slug ?? null,
      sortOrder: img.sortOrder ?? 0,
      isPrimary: img.isPrimary ?? false,
    };
  });

  // -------------------------
  // COLORS (UNIQUE)
  // -------------------------
  const colors = Array.from(
    new Map(
      variants.map((v) => [
        v.color.id,
        {
          id: v.color.id,
          name: v.color.name,
          slug: v.color.slug,
          hexCode: v.color.hexCode,
        },
      ]),
    ).values(),
  );

  // -------------------------
  // SIZES (UNIQUE + SORTED)
  // -------------------------
  const sizes = Array.from(
    new Map(
      variants.map((v) => [
        v.size.id,
        {
          id: v.size.id,
          name: v.size.name,
          slug: v.size.slug,
          sortOrder: v.size.sortOrder,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  // -------------------------
  // PRICE LOGIC
  // -------------------------
  const prices = variants.map((v) => v.price);
  const effectivePrices = variants.map((v) => v.salePrice ?? v.price);

  const price = prices.length ? Math.min(...prices) : 0;
  const effective = effectivePrices.length ? Math.min(...effectivePrices) : 0;

  const isOnSale = product.isOnSale;

  // -------------------------
  // FINAL RETURN (STRICT TYPE)
  // -------------------------
  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",

    category: product.category
      ? {
          id: String(product.category._id),
          name: product.category.name,
          slug: product.category.slug,
        }
      : { id: "", name: "", slug: "" },

    gender: product.gender
      ? {
          id: String(product.gender._id),
          label: product.gender.label,
          slug: product.gender.slug,
        }
      : { id: "", label: "", slug: "" },

    price,
    salePrice: isOnSale ? effective : null,
    isOnSale,

    variants,
    images,
    colors,
    sizes,
  };
}

export async function getRecommendedProductsService(
  params: Params,
): Promise<ProductListItem[]> {
  const products = await findRecommendedProductsRepo(params);

  return products.map((p: any): ProductListItem => {
    const price = p.price ?? 0;
    const salePrice = p.salePrice ?? null;

    return {
      id: String(p._id),
      name: p.name ?? "",
      slug: p.slug ?? "",

      gender: {
        label: p.gender?.label ?? "",
        slug: p.gender?.slug ?? "",
      },

      category: {
        name: p.category?.name ?? "",
        slug: p.category?.slug ?? "",
      },

      price,
      salePrice,
      isOnSale: salePrice !== null && price !== null && salePrice < price,

      // ✅ IMPORTANT: correct field name
      primaryImageUrl: p.primaryImage?.url ?? null,

      // ✅ always return array
      colors: Array.isArray(p.variantColors)
        ? p.variantColors.map((c: any) => ({
            name: c.name ?? "",
            slug: c.slug ?? "",
            hexCode: c.hexCode ?? "",
          }))
        : [],

      // ✅ safe quick add
      quickAddVariant:
        p.quickAddRaw && p.quickAddColor && p.quickAddSize
          ? {
              id: String(p.quickAddRaw._id),
              sku: p.quickAddRaw.sku ?? "",
              price: p.quickAddRaw.price ?? 0,
              salePrice: p.quickAddRaw.salePrice ?? null,
              inStock: p.quickAddRaw.inStock ?? 0,
              color: {
                name: p.quickAddColor.name ?? "",
                hexCode: p.quickAddColor.hexCode ?? "",
              },
              size: {
                name: p.quickAddSize.name ?? "",
              },
            }
          : null,
    };
  });
}

export async function getAdminProductsService(): Promise<
  AdminProductTableItem[]
> {
  const products = await findAdminProductsRepo();

  return products.map((p: any) => ({
    id: String(p._id),
    name: p.name,
    slug: p.slug,

    minPrice: p.minPrice ?? 0,
    maxPrice: p.maxPrice ?? 0,

    totalStock: p.totalStock ?? 0,
    imageCount: p.imageCount ?? 0,
    variantCount: p.variantCount ?? 0,

    isOnSale: p.isOnSale ?? false,

    primaryImageUrl: p.primaryImageUrl ?? null,

    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",

    gender: p.gender?.label
      ? {
          label: p.gender.label,
          slug: p.gender.slug,
        }
      : null,

    category: p.category?.name
      ? {
          name: p.category.name,
          slug: p.category.slug,
        }
      : null,
  }));
}
