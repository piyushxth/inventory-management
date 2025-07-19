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

export default function Home() {
  return (
    <div>
      <Hero />
      <Collections />
      <HeroVideo />
      <Features />
      <MediaCard />
      <BestSelling />
      <Instagram />
      {/* <FeaturedProducts /> */}
      {/* <EleganceSection /> */}
      {/* <Trending /> */}
    </div>
  );
}
