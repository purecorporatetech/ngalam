import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import FeaturedDrop from "@/components/FeaturedDrop";
import StorytellingSection from "@/components/StorytellingSection";
import CollectionGrid from "@/components/CollectionGrid";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturedDrop />
        <StorytellingSection />
        <CollectionGrid />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
