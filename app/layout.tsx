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

  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://candianscart.ca"),
  title: {
    default: "Candian's Cart | Smart grocery shopping for families",
    template: "%s | Candian's Cart",
  },
  description: "Your favorite grocery app. Order fresh produce, dairy, and everyday essentials for easy pickup or in-store shopping.",
  keywords: ["grocery delivery", "fresh produce", "Candian's Cart", "online grocery", "food delivery"],
  authors: [{ name: "Candian Cart Team" }],
  creator: "Candian's Cart",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    title: "Candian's Cart | Smart grocery shopping for families",
    description: "Your favorite grocery app. Order fresh produce, dairy, and everyday essentials for easy pickup or in-store shopping.",
    siteName: "Candian's Cart",
    images: [
      {
        url: "/CC-Logo.png",
        width: 1200,
        height: 630,
        alt: "Candian's Cart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candian's Cart | Smart grocery shopping for families",
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
}; // <-- THIS was missing

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
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}