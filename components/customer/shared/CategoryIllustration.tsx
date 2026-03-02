// components/customer/shared/CategoryIllustration.tsx
import Image from "next/image";

export type GroceryCategory = string;

interface CategoryIllustrationProps {
  category: GroceryCategory;
  className?: string;
}

const normalize = (cat: string) => cat.toLowerCase().trim();

export const CategoryIllustration = ({
  category,
  className = "",
}: CategoryIllustrationProps) => {
  const cat = normalize(category);

  // ─── Map categories to your local public folder images ───────────────
  // Hardcoded image links | if image is in imagekit show that otherwise show this
  const imageMap: Record<string, string> = {
    "fruits": "https://www.thehealthy.com/wp-content/uploads/2025/05/GettyImages-2178111688.jpg",
    "vegetables": "https://cdn.britannica.com/17/196817-050-6A15DAC3/vegetables.jpg?w=400&h=300&c=crop",
    "dairy": "https://media.istockphoto.com/id/910881428/photo/dairy-products-shot-on-rustic-wooden-table.jpg?s=612x612&w=0&k=20&c=Xh_dDL7XsV0Rff_aIrLOQJ1ZoapugiatmXUxWdo7q2s=",
    "meat": "https://media.istockphoto.com/id/1443190699/photo/different-types-of-raw-meat.jpg?s=612x612&w=0&k=20&c=bCxqsBiCno4-6WUYKnm08iW_wOqupbQjGEz5An_FIGg=",
    "bakery": "https://images.squarespace-cdn.com/content/v1/5ea9ec8fdd995955ed38dcdd/62dda88d-76ca-4e61-acb9-a79b42ed5263/midnys.jpg",
    "beverages": "https://static.vecteezy.com/system/resources/thumbnails/026/500/574/small/summer-refreshing-beverages-photo.jpg",
    "snacks": "https://static.toiimg.com/photo/59217136.cms",
    "household": "https://hips.hearstapps.com/hmg-prod/images/gettyimages-510693044-1550590816.jpg?crop=0.8890322580645161xw:1xh;center,top&resize=1200:*",
    "personal care": "https://yalladealnow.com/cdn/shop/articles/yalla-deal-blog-10-without.png?v=1750954322",
    "other": "https://www.theorderexpert.com/wp-content/uploads/2023/04/how-to-organize-miscellaneous-items.jpg",
  };

  // Fallback to a default image if category doesn't match
  const src = imageMap[cat] || "/images/categories/default.jpg";

  return (
    <Image
      src={src}
      alt={`${category} category fallback`}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
};

// ─── Category config — used everywhere for colors, emoji, badges ─────────────
export const CATEGORY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; emoji: string; gradient: string }
> = {
  Fruits: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    emoji: "🥭",
    gradient: "from-amber-400 to-orange-500",
  },
  Vegetables: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    emoji: "🥦",
    gradient: "from-green-400 to-emerald-500",
  },
  Dairy: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    emoji: "🥛",
    gradient: "from-yellow-300 to-amber-400",
  },
  Meat: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    emoji: "🍗",
    gradient: "from-red-400 to-rose-500",
  },
  Bakery: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🫓",
    gradient: "from-orange-300 to-amber-400",
  },
  Beverages: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    emoji: "☕",
    gradient: "from-yellow-500 to-orange-400",
  },
  Snacks: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🥟",
    gradient: "from-orange-400 to-yellow-400",
  },
  Household: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    emoji: "🧹",
    gradient: "from-blue-400 to-cyan-400",
  },
  "Personal Care": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    emoji: "🪥",
    gradient: "from-purple-400 to-pink-400",
  },
  Other: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    emoji: "🛒",
    gradient: "from-slate-400 to-slate-500",
  },
};

export const getCategoryConfig = (category: string) =>
  CATEGORY_CONFIG[category] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    emoji: "🛒",
    gradient: "from-slate-400 to-slate-500",
  };

export const ALL_CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Beverages",
  "Snacks",
  "Household",
  "Personal Care",
  "Other",
];