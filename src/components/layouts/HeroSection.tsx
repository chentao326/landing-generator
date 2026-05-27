'use client';

import React from 'react';
import type { HeroSection as HeroSectionType, LayoutSkeleton, ColorScheme } from '@/lib/types';

interface HeroSectionProps {
  data: HeroSectionType;
  skeleton: LayoutSkeleton;
  colorScheme: ColorScheme;
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center">
      <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

function renderHeroLeft(data: HeroSectionType, colorScheme: ColorScheme) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          style={{ color: colorScheme.primary }}>
          {data.headline}
        </h1>
        <p className="text-lg sm:text-xl mb-8" style={{ color: colorScheme.text }}>
          {data.subheadline}
        </p>
        {data.ctaText && (
          <button
            className="px-8 py-4 text-lg font-semibold rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: colorScheme.accent, color: colorScheme.background }}
          >
            {data.ctaText}
          </button>
        )}
      </div>
      <div className="flex-1 w-full">
        <ImagePlaceholder />
      </div>
    </div>
  );
}

function renderHeroCenter(data: HeroSectionType, colorScheme: ColorScheme) {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
        style={{ color: colorScheme.primary }}>
        {data.headline}
      </h1>
      <p className="text-xl sm:text-2xl mb-10 max-w-2xl mx-auto" style={{ color: colorScheme.text }}>
        {data.subheadline}
      </p>
      {data.ctaText && (
        <button
          className="px-10 py-5 text-xl font-semibold rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: colorScheme.accent, color: colorScheme.background }}
        >
          {data.ctaText}
        </button>
      )}
      <div className="mt-12 max-w-3xl mx-auto">
        <ImagePlaceholder />
      </div>
    </div>
  );
}

function renderHeroSplit(data: HeroSectionType, colorScheme: ColorScheme) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-0">
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16"
        style={{ backgroundColor: colorScheme.primary }}>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
          style={{ color: colorScheme.background }}>
          {data.headline}
        </h1>
        <p className="text-lg mb-8" style={{ color: colorScheme.background, opacity: 0.9 }}>
          {data.subheadline}
        </p>
        {data.ctaText && (
          <button
            className="self-start px-8 py-4 text-lg font-semibold rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: colorScheme.accent, color: colorScheme.background }}
          >
            {data.ctaText}
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16"
        style={{ backgroundColor: colorScheme.secondary }}>
        <div className="w-full">
          <ImagePlaceholder />
        </div>
      </div>
    </div>
  );
}

function renderHeroMinimal(data: HeroSectionType, colorScheme: ColorScheme) {
  return (
    <div className="text-left max-w-3xl">
      <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light leading-none mb-6"
        style={{ color: colorScheme.primary }}>
        {data.headline}
      </h1>
      <p className="text-lg sm:text-xl font-light mb-10" style={{ color: colorScheme.text }}>
        {data.subheadline}
      </p>
      {data.ctaText && (
        <button
          className="px-8 py-3 text-base font-medium rounded-full transition-opacity hover:opacity-90 border"
          style={{
            backgroundColor: colorScheme.accent,
            color: colorScheme.background,
            borderColor: colorScheme.accent,
          }}
        >
          {data.ctaText}
        </button>
      )}
    </div>
  );
}

export default function HeroSection({ data, skeleton, colorScheme }: HeroSectionProps) {
  const renderers: Record<LayoutSkeleton, () => React.ReactNode> = {
    'hero-left': () => renderHeroLeft(data, colorScheme),
    'hero-center': () => renderHeroCenter(data, colorScheme),
    'hero-split': () => renderHeroSplit(data, colorScheme),
    'hero-minimal': () => renderHeroMinimal(data, colorScheme),
  };

  return (
    <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: colorScheme.background }}>
      <div className="max-w-7xl mx-auto">
        {renderers[skeleton]()}
      </div>
    </section>
  );
}
