import EleganceSection from "@/components/client/EleganceSection";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import Hero from "@/components/client/Hero";
import Trending from "@/components/client/Trending";

export default function Home() {
  return (
    <div className="container">
      <Hero />
      <FeaturedProducts/>
      <EleganceSection/>
      {/* <Trending /> */}
    </div>
  );
}
