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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.canadianscart.ca",
  ),
  alternates: {
    canonical: "https://www.canadianscart.ca",
  },
  title: {
    default: "Candian's Cart | Smart grocery shopping for families",
    template: "%s | Candian's Cart",
  },
  description:
    "Purchase items and save up to 30% on everyday groceries — subsidised exclusively for Canadian families.",
  keywords: [
    "grocery savings",
    "grocery deals",
    "budget groceries",
    "fresh produce",
    "Candian's Cart",
    "online grocery",
    "in-store grocery savings",
    "online grocery savings",
  ],
  authors: [{ name: "Candian's Cart Team" }],
  creator: "Candian's Cart",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    title: "Candian's Cart | Smart grocery shopping for families",
    description:
      "Purchase items and save up to 30% on everyday groceries — subsidised exclusively for Canadian families.",
    siteName: "Candian's Cart",
    images: [
      {
        url: "https://ik.imagekit.io/h7w5h0hou/opengraph-cc-logo.png",
        width: 1200,
        height: 630,
        alt: "Candian's Cart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candian's Cart | Smart grocery shopping for families",
    description:
      "Save money on groceries with ease—discover deals, compare prices, and shop smarter in-store or online with Candian’s Cart.",
    images: ["https://ik.imagekit.io/h7w5h0hou/opengraph-cc-logo.png"],
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
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}