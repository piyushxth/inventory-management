// ProductRecommendations.tsx

import { getRecommendedProductsService } from "@/libs/services/product.service";
import ProductRecommendationsSlider from "./ProductRecommendationSlider";

type RecommendationType = "trending" | "related";

type Props = {
  productId?: string;
  categoryId?: string;
  genderId?: string;
  limit?: number;
  type?: RecommendationType;
};

export async function ProductRecommendations({
  productId,
  categoryId,
  genderId,
  limit = 8,
  type = "trending",
}: Props) {
  const items = await getRecommendedProductsService({
    productId,
    categoryId,
    genderId,
    limit,
    type,
  });

  if (!items || items.length === 0) return null;

  return <ProductRecommendationsSlider items={items} type={type} />;
}
