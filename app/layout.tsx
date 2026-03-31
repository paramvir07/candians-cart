import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  // Use your production URL here, fall back to localhost for dev
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://candiancart.com"),
  title: {
    default: "Candian Cart | Fresh Groceries Delivered",
    template: "%s | Candian Cart", // e.g., "Home | Candian Cart"
  },
  description: "Your favorite grocery app. Get fresh produce, dairy, and everyday essentials delivered right to your door.",
  keywords: ["grocery delivery", "fresh produce", "Candian Cart", "online grocery", "food delivery"],
  authors: [{ name: "Candian Cart Team" }],
  creator: "Candian Cart",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    title: "Candian Cart | Fresh Groceries Delivered",
    description: "Your favorite grocery app. Get fresh produce, dairy, and everyday essentials delivered right to your door.",
    siteName: "Candian Cart",
    images: [
      {
        url: "/CC-Logo.png", // Utilizing your existing logo for social previews
        width: 1200,
        height: 630,
        alt: "Candian Cart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candian Cart | Fresh Groceries Delivered",
    description: "Your favorite grocery app.",
    images: ["/CC-Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        {children}
        <Toaster position="top-right" richColors/>
      </body>
    </html>
  );
}

