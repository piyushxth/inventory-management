import BestSelling from "@/components/client/BestSelling";
import Collections from "@/components/client/Collections";
import EleganceSection from "@/components/client/EleganceSection";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import Features from "@/components/client/Features";
import Footer from "@/components/client/Footer";
import Hero from "@/components/client/Hero";
import HeroVideo from "@/components/client/HeroVideo";
import Instagram from "@/components/client/Instagram";
import MediaCard from "@/components/client/MediaCard";
import Trending from "@/components/client/Trending";
import { getProducts } from "@/libs/actions/productAction";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Product } from "@/libs/models/product";

export default async function Home() {
  const products = await getProducts({
    limit: 5,
    sortBy: { soldQuantity: -1 },
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
