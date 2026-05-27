import type { LandingPageContent, LayoutSkeleton, ColorScheme } from '@/lib/types';
import HeroSection from '@/components/layouts/HeroSection';
import FeaturesSection from '@/components/layouts/FeaturesSection';
import CTASection from '@/components/layouts/CTASection';
import FooterSection from '@/components/layouts/FooterSection';

interface LandingPageProps {
  content: LandingPageContent;
  skeleton: LayoutSkeleton;
  colorScheme: ColorScheme;
}

export default function LandingPage({ content, skeleton, colorScheme }: LandingPageProps) {
  return (
    <div style={{ backgroundColor: colorScheme.background, color: colorScheme.text }}>
      <HeroSection data={content.hero} skeleton={skeleton} colorScheme={colorScheme} />
      <FeaturesSection data={content.features} colorScheme={colorScheme} />
      <CTASection data={content.cta} colorScheme={colorScheme} />
      <FooterSection data={content.footer} colorScheme={colorScheme} />
    </div>
  );
}
