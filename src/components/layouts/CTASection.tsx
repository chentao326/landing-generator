'use client';

import type { CTASection as CTASectionType, ColorScheme } from '@/lib/types';

interface CTASectionProps {
  data: CTASectionType;
  colorScheme: ColorScheme;
}

export default function CTASection({ data, colorScheme }: CTASectionProps) {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: colorScheme.accent }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          style={{ color: colorScheme.background }}>
          {data.title}
        </h2>
        <p className="text-lg sm:text-xl mb-10 opacity-90"
          style={{ color: colorScheme.background }}>
          {data.description}
        </p>
        <button
          className="px-10 py-4 text-lg font-semibold rounded-lg transition-opacity hover:opacity-90 border-2"
          style={{
            color: colorScheme.accent,
            backgroundColor: colorScheme.background,
            borderColor: colorScheme.background,
          }}
        >
          {data.buttonText}
        </button>
      </div>
    </section>
  );
}
