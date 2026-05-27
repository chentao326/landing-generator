// Landing page type definitions

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export type LayoutSkeleton = "hero-left" | "hero-center" | "hero-split" | "hero-minimal";

export interface HeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundStyle: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSection {
  features: Feature[];
}

export interface CTASection {
  title: string;
  description: string;
  buttonText: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSection {
  companyName: string;
  links: FooterLink[];
}

export interface LandingPageContent {
  hero: HeroSection;
  features: FeaturesSection;
  cta: CTASection;
  footer: FooterSection;
}

export interface UserInput {
  productName: string;
  description: string;
  targetAudience: string;
  sellingPoints: string[];
}

export type GenerationStatus =
  | "generating_copy"
  | "generating_theme"
  | "done"
  | "error";

export interface GenerationResult {
  status: GenerationStatus;
  content?: LandingPageContent;
  colorScheme?: ColorScheme;
  error?: string;
}

export interface GenerateResponse {
  result: GenerationResult;
}
