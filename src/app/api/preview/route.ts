import { NextResponse } from 'next/server';
// Next.js 15 blocks direct import of react-dom/server in route handlers
// (see https://nextjs.org/docs/app/building-your-application/rendering).
// Using createRequire as a workaround to load the Node.js CJS module at runtime.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { renderToStaticMarkup } = require('react-dom/server');
import { z } from 'zod';
import LandingPage from '@/components/layouts/LandingPage';
import { colorSchemeSchema } from '@/lib/schemas';
import { rateLimit } from "@/lib/rate-limit";

// ------------------------------------------------------------------ Zod schemas

const heroSectionSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  ctaText: z.string(),
  backgroundStyle: z.string(),
});

const featureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

const featuresSectionSchema = z.object({
  features: z.array(featureSchema),
});

const ctaSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
});

const footerLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const footerSectionSchema = z.object({
  companyName: z.string(),
  links: z.array(footerLinkSchema),
});

const landingPageContentSchema = z.object({
  hero: heroSectionSchema,
  features: featuresSectionSchema,
  cta: ctaSectionSchema,
  footer: footerSectionSchema,
});

const skeletonSchema = z.enum([
  'hero-left',
  'hero-center',
  'hero-split',
  'hero-minimal',
]);

const previewRequestSchema = z.object({
  content: landingPageContentSchema,
  skeleton: skeletonSchema,
  colorScheme: colorSchemeSchema,
});

// ------------------------------------------------------------------ POST handler

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(rl.reset) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = previewRequestSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json({ error: `校验失败: ${errors.join('; ')}` }, { status: 400 });
    }

    const { content, skeleton, colorScheme } = parsed.data;

    // Render LandingPage component to static HTML
    const componentHtml = renderToStaticMarkup(
      LandingPage({ content, skeleton, colorScheme })
    );

    // Build full HTML document
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --color-primary: ${colorScheme.primary};
      --color-secondary: ${colorScheme.secondary};
      --color-background: ${colorScheme.background};
      --color-text: ${colorScheme.text};
      --color-accent: ${colorScheme.accent};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body>
${componentHtml}
</body>
</html>`;

    return NextResponse.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器内部错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
