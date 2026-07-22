import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ReassuranceBar from "@/components/ReassuranceBar";
import EditionTeaser from "@/components/EditionTeaser";
import CollectionGrid from "@/components/CollectionGrid";
import StorySection from "@/components/StorySection";
import CircleSection from "@/components/CircleSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <ReassuranceBar />
        {/* Teaser affiché uniquement si une Édition est réellement ouverte.
            Conteneur sans padding vertical : aucune bande vide quand null. */}
        <div className="max-w-6xl mx-auto px-5 md:px-6 [&:not(:empty)]:pt-10 md:[&:not(:empty)]:pt-14">
          <EditionTeaser />
        </div>
        <CollectionGrid />
        <StorySection />
        <CircleSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
