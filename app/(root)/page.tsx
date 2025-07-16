import Collections from "@/components/client/Collections";
import EleganceSection from "@/components/client/EleganceSection";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import Features from "@/components/client/Features";
import Hero from "@/components/client/Hero";
import HeroVideo from "@/components/client/HeroVideo";
import Trending from "@/components/client/Trending";

export default function Home() {
  return (
    <div>
      <Hero />
      <Collections />
      <HeroVideo />
      <Features />
      <FeaturedProducts />
      <EleganceSection />
      {/* <Trending /> */}
    </div>
  );
}
