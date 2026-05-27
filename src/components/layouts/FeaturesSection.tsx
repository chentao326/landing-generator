'use client';

import type { FeaturesSection as FeaturesSectionType, ColorScheme } from '@/lib/types';
import * as Icons from 'lucide-react';

interface FeaturesSectionProps {
  data: FeaturesSectionType;
  colorScheme: ColorScheme;
}

function FeatureIcon({ iconName }: { iconName: string }) {
  const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{
    className?: string;
    size?: number;
  }> | undefined;

  if (!IconComponent) {
    return <div className="w-8 h-8 rounded bg-gray-200" />;
  }

  return <IconComponent className="w-8 h-8" />;
}

function FeatureCard({
  icon,
  title,
  description,
  colorScheme,
}: {
  icon: string;
  title: string;
  description: string;
  colorScheme: ColorScheme;
}) {
  return (
    <div className="p-8 rounded-xl border transition-shadow hover:shadow-lg"
      style={{ borderColor: colorScheme.secondary, backgroundColor: colorScheme.background }}>
      <div className="mb-4" style={{ color: colorScheme.primary }}>
        <FeatureIcon iconName={icon} />
      </div>
      <h3 className="text-xl font-semibold mb-3" style={{ color: colorScheme.primary }}>
        {title}
      </h3>
      <p className="leading-relaxed" style={{ color: colorScheme.text }}>
        {description}
      </p>
    </div>
  );
}

export default function FeaturesSection({ data, colorScheme }: FeaturesSectionProps) {
  if (!data.features || data.features.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: colorScheme.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              colorScheme={colorScheme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
