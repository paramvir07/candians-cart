// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.canadianscart.ca/";

  // Define the public static routes of Candian Cart
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/careers",
    "/privacy",
    "/terms",
    "/customer/search",
    "/customer/budget-packs",
    "/customer/subsidy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8, // Homepage gets highest priority
  }));

  return [...staticRoutes];
}
