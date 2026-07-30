import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AYEZA COSMETICS - Luxury Beauty Products",
  description: "Discover premium luxury cosmetics curated for the modern woman. Shop skincare, makeup, fragrances, and more.",
  keywords: ["cosmetics", "beauty", "skincare", "makeup", "luxury", "Pakistan"],
  authors: [{ name: "AYEZA COSMETICS" }],
  openGraph: {
    title: "AYEZA COSMETICS - Luxury Beauty Products",
    description: "Discover premium luxury cosmetics curated for the modern woman.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
