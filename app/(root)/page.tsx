import BestSelling from "@/components/client/BestSelling";
import Collections from "@/components/client/Collections";
import Features from "@/components/client/Features";
import Hero from "@/components/client/Hero";
import HeroVideo from "@/components/client/HeroVideo";
import Instagram from "@/components/client/Instagram";
import MediaCard from "@/components/client/MediaCard";
import { getProducts } from "@/libs/actions/productAction";

// Home fetches live product data, so opt out of build-time prerender.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts({
    limit: 5,
    sortBy: { createdAt: -1 },
  });
  return (
    <div>
      <Hero />
      <Collections />
      <Features />
      <BestSelling products={products} />
      <HeroVideo />
      <MediaCard />
      <Instagram />
      {/* <FeaturedProducts /> */}
      {/* <EleganceSection /> */}
      {/* <Trending /> */}
    </div>
  );
}
