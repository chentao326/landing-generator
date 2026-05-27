'use client';

import type { FooterSection as FooterSectionType, ColorScheme } from '@/lib/types';

interface FooterSectionProps {
  data: FooterSectionType;
  colorScheme: ColorScheme;
}

export default function FooterSection({ data, colorScheme }: FooterSectionProps) {
  return (
    <footer className="py-12 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: colorScheme.accent }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="font-semibold text-lg" style={{ color: colorScheme.background }}>
          {data.companyName}
        </p>
        <nav>
          <ul className="flex flex-wrap justify-center gap-6">
            {data.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="transition-opacity hover:opacity-80 text-sm"
                  style={{ color: colorScheme.background }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
