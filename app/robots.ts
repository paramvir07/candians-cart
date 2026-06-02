// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/cashier/",
        "/store/",
        "/customer/wallet/",
        "/customer/profile/",
        "/customer/orders/",
      ],
    },
    sitemap: "https://www.canadianscart.ca/sitemap.xml",
  };
}
