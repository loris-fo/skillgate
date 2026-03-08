import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AnimatedMockup } from "@/components/landing/animated-mockup";
import { BadgeSnippet } from "@/components/landing/badge-snippet";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AnimatedMockup />
      <BadgeSnippet />
    </>
  );
}
