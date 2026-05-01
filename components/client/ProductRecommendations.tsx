import { ProductCard } from "@/components/client/ProductCard copy";
import { getRecommendedProductsService } from "@/libs/services/product.service";

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
  limit = 4,
  type = "trending",
}: Props) {
  const items = await getRecommendedProductsService({
    productId,
    categoryId,
    genderId,
    limit,
    type, // 👈 pass it to backend logic
  });

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="You might also like"
      className="mt-20 border-t border-black/5 pt-12 dark:border-white/10"
    >
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {type === "trending" ? "Trending Products" : "You might also like"}
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
