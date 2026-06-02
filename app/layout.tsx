import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterWrapper } from "@/components/shared/Toast-wrapper";

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
  applicationName: "Canadian's Cart",
  alternates: {
    canonical: "https://www.canadianscart.ca",
  },
  appleWebApp: {
    title: "Canadian's Cart",
  },
  title: {
    default: "Canadian's Cart",
    template: "%s | CC",
  },
  description:
    "Purchase items and save up to 30% on everyday groceries — subsidised exclusively for Canadian families.",
  keywords: [
    "grocery savings",
    "grocery deals",
    "budget groceries",
    "fresh produce",
    "Canadian's Cart",
    "online grocery",
    "in-store grocery savings",
    "online grocery savings",
  ],
  authors: [{ name: "Canadian's Cart Team" }],
  creator: "Canadian's Cart",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://www.canadianscart.ca",
    title: "Canadian's Cart | Smart grocery shopping for families",
    description:
      "Purchase items and save up to 30% on everyday groceries — subsidised exclusively for Canadian families.",
    siteName: "Canadian's Cart",
    images: [
      {
        url: "https://ik.imagekit.io/h7w5h0hou/opengraph-cc-logo.png",
        width: 1200,
        height: 630,
        alt: "Canadian's Cart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canadian's Cart | Smart grocery shopping for families",
    description:
      "Save money on groceries with ease—discover deals, compare prices, and shop smarter in-store or online with Canadian’s Cart.",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Canadian's Cart",
              alternateName: "Canadian's Cart",
              url: "https://www.canadianscart.ca",
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <ToasterWrapper />
      </body>
    </html>
  );
}