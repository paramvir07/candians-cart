import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterWrapper } from "@/components/shared/Toast-wrapper";
import Script from "next/script";

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

// NOTE: I highly recommend you fix "Candian's" to "Candian's" across all these fields.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.canadianscart.ca",
  ),
  applicationName: "Candian's Cart",
  alternates: {
    canonical: "https://www.canadianscart.ca",
  },
  appleWebApp: {
    title: "Candian's Cart",
  },
  title: {
    default: "Candian's Cart",
    template: "%s | CC",
  },
  verification: {
    google: "K1hJenaTamdZ3ahQkaJ8SiM3Ou8qOilAeRNlKlDy1ec",
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
    url: "https://www.canadianscart.ca",
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
        {/* Meta Pixel Code - Native Next.js Implementation */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1329662761972178');
            fbq('track', 'PageView');
          `}
        </Script>

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Candian's Cart",
              alternateName: "Candian's Cart",
              url: "https://www.canadianscart.ca",
            }).replace(/</g, "\\u003c"),
          }}
        />

        {children}
        <ToasterWrapper />

        {/* Meta Pixel Fallback - React syntax applied */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1329662761972178&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
      </body>
    </html>
  );
}
