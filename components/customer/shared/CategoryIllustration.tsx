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

  const imageMap: Record<string, string> = {
    fruits:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
    vegetables:
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&q=80",
    dairy:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&q=80",
    meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80",
    bakery:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    beverages:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
    snacks:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80",
    household:
      "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600&q=80",
    "oil & ghee":
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
    "pulses & lentils":
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80",
    "flour & atta":
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    rice: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",
    spices:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    "pickles & chutneys":
      "https://images.unsplash.com/photo-1589135716184-03b788f87b3c?w=600&q=80",
    "instant foods":
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
    "frozen foods":
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80",
    "sweets & mithai":
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80",
    "dry fruits & nuts":
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80",
    "tea & coffee":
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    "sauces & condiments":
      "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600&q=80",
    "papad & fryums":
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
    "pooja / religious items":
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&q=80",
    utensils:
      "https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600&q=80",
    disposables:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80",
    "personal care":
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
    other:
      "https://images.unsplash.com/photo-1543168256-418811576931?w=600&q=80",
  };

  const src =
    imageMap[cat] ||
    "https://images.unsplash.com/photo-1543168256-418811576931?w=600&q=80";

  return (
    <Image
      src={src}
      alt={`${category} category`}
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
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-200",
    emoji: "🧃",
    gradient: "from-cyan-400 to-blue-400",
  },
  Snacks: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🍿",
    gradient: "from-orange-400 to-yellow-400",
  },
  Household: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    emoji: "🧹",
    gradient: "from-blue-400 to-cyan-400",
  },
  "Oil & Ghee": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    emoji: "🫙",
    gradient: "from-yellow-400 to-amber-500",
  },
  "Pulses & Lentils": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    emoji: "🫘",
    gradient: "from-amber-400 to-yellow-500",
  },
  "Flour & Atta": {
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    emoji: "🌾",
    gradient: "from-stone-400 to-amber-400",
  },
  Rice: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    emoji: "🍚",
    gradient: "from-slate-300 to-stone-400",
  },
  Spices: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
    emoji: "🌶️",
    gradient: "from-red-500 to-orange-500",
  },
  "Pickles & Chutneys": {
    bg: "bg-lime-50",
    text: "text-lime-800",
    border: "border-lime-300",
    emoji: "🫙",
    gradient: "from-lime-400 to-green-500",
  },
  "Instant Foods": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    emoji: "🍜",
    gradient: "from-orange-400 to-red-400",
  },
  "Frozen Foods": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    emoji: "🧊",
    gradient: "from-sky-300 to-blue-400",
  },
  "Sweets & Mithai": {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    emoji: "🍮",
    gradient: "from-pink-400 to-rose-400",
  },
  "Dry Fruits & Nuts": {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-300",
    emoji: "🥜",
    gradient: "from-amber-500 to-yellow-600",
  },
  "Tea & Coffee": {
    bg: "bg-brown-50",
    text: "text-amber-900",
    border: "border-amber-400",
    emoji: "☕",
    gradient: "from-amber-700 to-yellow-800",
  },
  "Sauces & Condiments": {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    emoji: "🥫",
    gradient: "from-red-400 to-orange-400",
  },
  "Papad & Fryums": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    emoji: "🥞",
    gradient: "from-yellow-300 to-orange-300",
  },
  "Pooja / Religious Items": {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    emoji: "🪔",
    gradient: "from-orange-400 to-red-400",
  },
  Utensils: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    emoji: "🍳",
    gradient: "from-gray-400 to-slate-500",
  },
  Disposables: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    emoji: "🥡",
    gradient: "from-teal-400 to-cyan-400",
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
  "Oil & Ghee",
  "Pulses & Lentils",
  "Flour & Atta",
  "Rice",
  "Spices",
  "Pickles & Chutneys",
  "Instant Foods",
  "Frozen Foods",
  "Sweets & Mithai",
  "Dry Fruits & Nuts",
  "Tea & Coffee",
  "Sauces & Condiments",
  "Papad & Fryums",
  "Pooja / Religious Items",
  "Utensils",
  "Disposables",
  "Personal Care",
  "Other",
];
