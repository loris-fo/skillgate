import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesDemoSection } from "@/components/landing/features-demo-section";
import { BadgeSnippet } from "@/components/landing/badge-snippet";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesDemoSection />
      <BadgeSnippet />
    </>
  );
}
