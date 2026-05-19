"use server";
import {
  getAdminProductsService,
  getProductBySlugService,
  getRecommendedProductsService,
  listProductsService,
} from "@/libs/services/product.service";
import { getFilterOptionsService } from "@/libs/services/filter.service";
import { AdminProductTableItem, ProductQuery } from "@/libs/products.types";

export async function listProducts(query: ProductQuery) {
  return listProductsService(query);
}

export async function getProductFilterOptions() {
  return getFilterOptionsService();
}

export async function getProductBySlug(slug: string) {
  return getProductBySlugService(slug);
}

export async function getRecommendedProducts(params: {
  type?: "related" | "trending";
  productId?: string;
  categoryId?: string;
  genderId?: string;
  limit?: number;
}) {
  return getRecommendedProductsService(params);
}

export async function getAdminProducts(): Promise<AdminProductTableItem[]> {
  return getAdminProductsService();
}
