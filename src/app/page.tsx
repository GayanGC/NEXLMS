import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import ScaleValueSection from "@/components/ScaleValueSection";
import AntiPiracySection from "@/components/AntiPiracySection";
import CalculatorSection from "@/components/CalculatorSection";
import SocialProofPricing from "@/components/SocialProofPricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <ScaleValueSection />
        <AntiPiracySection />
        <CalculatorSection />
        <SocialProofPricing />
      </main>
      <Footer />
    </>
  );
}
