import BestSelling from "@/components/client/BestSelling";
import Collections from "@/components/client/Collections";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import Features from "@/components/client/Features";
import Hero from "@/components/client/Hero";
import HeroVideo from "@/components/client/HeroVideo";
import Instagram from "@/components/client/Instagram";
import MediaCard from "@/components/client/MediaCard";
import { ProductRecommendations } from "@/components/client/ProductRecommendations";
import { getRecommendedProducts } from "@/libs/actions/products/r";

// Home fetches live product data, so opt out of build-time prerender.
export const dynamic = "force-dynamic";

export default async function Home() {
  const p = await getRecommendedProducts({
    limit: 8,
    type: "trending",
  });
  return (
    <div>
      <Hero />
      {/* <FeaturedProducts /> */}
      <BestSelling products={p} />
      {/* <ProductRecommendations /> */}
      <Collections />
      <Features />
      <HeroVideo />
      <MediaCard />
      <Instagram />
      {/* <FeaturedProducts /> */}
      {/* <EleganceSection /> */}
      {/* <Trending /> */}
    </div>
  );
}
