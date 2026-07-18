import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import StorytellingSection from "@/components/StorytellingSection";
import CollectionGrid from "@/components/CollectionGrid";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        {/* TODO Chantier 7 : bloc « Édition Signares en cours » */}
        <StorytellingSection />
        <CollectionGrid />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
