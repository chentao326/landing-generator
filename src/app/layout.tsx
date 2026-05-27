import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landing Generator",
  description: "AI-powered landing page generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
