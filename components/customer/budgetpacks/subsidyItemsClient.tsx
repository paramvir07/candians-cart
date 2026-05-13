"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Package,
  Leaf,
  Milk,
  Apple,
  ShoppingBasket,
  Wheat,
  Fish,
  Beef,
  Cookie,
  Droplets,
  FlameKindling,
  Salad,
  Bean,
  Tag,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SubsidyItem {
  _id: string;
  name: string;
  category: string;
}

type SortOrder = "az" | "za" | "default";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPECIAL_CATEGORIES = ["produce", "dairy", "fruits", "vegetables"];

// ─── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; img: string; accent: string }> = {
  "oil & ghee": {
    icon: <FlameKindling size={16} />,
    img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#d97706",
  },
  "flour & atta": {
    icon: <Wheat size={16} />,
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#92400e",
  },
  fruits: {
    icon: <Apple size={16} />,
    img: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#dc2626",
  },
  vegetables: {
    icon: <Leaf size={16} />,
    img: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#16a34a",
  },
  produce: {
    icon: <Leaf size={16} />,
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#15803d",
  },
  dairy: {
    icon: <Milk size={16} />,
    img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#0369a1",
  },
  meat: {
    icon: <Beef size={16} />,
    img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#b91c1c",
  },
  seafood: {
    icon: <Fish size={16} />,
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#0e7490",
  },
  grains: {
    icon: <Wheat size={16} />,
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#92400e",
  },
  bakery: {
    icon: <Cookie size={16} />,
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#b45309",
  },
  beverages: {
    icon: <Droplets size={16} />,
    img: "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#1d4ed8",
  },
  snacks: {
    icon: <Cookie size={16} />,
    img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#c2410c",
  },
  lentils: {
    icon: <Bean size={16} />,
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#92400e",
  },
  salads: {
    icon: <Salad size={16} />,
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#15803d",
  },
};

function getCategoryConfig(cat: string) {
  const lower = cat.toLowerCase();
  for (const [key, cfg] of Object.entries(CATEGORY_CONFIG)) {
    if (lower.includes(key)) return cfg;
  }
  return {
    icon: <ShoppingBasket size={16} />,
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop&auto=format&q=80",
    accent: "#4b5563",
  };
}

// ─── Item Chip ─────────────────────────────────────────────────────────────────

function ItemChip({ name, index }: { name: string; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 25);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 bg-secondary border border-border rounded-full pl-2.5 pr-3 py-1 transition-all duration-300",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95",
      )}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      <span className="text-[11px] sm:text-xs font-medium text-secondary-foreground capitalize whitespace-nowrap max-w-[160px] sm:max-w-[200px] overflow-hidden text-ellipsis tracking-wide">
        {name.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Special Banner ────────────────────────────────────────────────────────────

function AllItemsBanner({ category, index }: { category: string; index: number }) {
  const [cardVisible, setCardVisible] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const cfg = getCategoryConfig(category);

  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 60 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border shadow-md transition-all duration-500",
        cardVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]",
      )}
    >
      <div className="relative h-36 sm:h-40 overflow-hidden">
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover brightness-[0.55] saturate-[1.2] scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package size={40} strokeWidth={1} className="text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border-0">
          <CheckCircle2 size={10} />
          Full section
        </Badge>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3.5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            {cfg.icon}
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg text-white leading-tight capitalize tracking-tight">
              {category}
            </div>
            <div className="text-[11px] text-white/70 font-medium mt-0.5">Entire section subsidised</div>
          </div>
        </div>
      </div>

      <CardContent className="px-4 py-3.5 border-t border-border bg-secondary flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} className="text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground tracking-tight">100+ Items</div>
          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Every item in the{" "}
            <span className="capitalize font-semibold text-primary">{category}</span>{" "}
            section is eligible for subsidy
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  items,
  sort,
  index,
}: {
  category: string;
  items: SubsidyItem[];
  sort: SortOrder;
  index: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const cfg = getCategoryConfig(category);

  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 60 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "az") copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") copy.sort((a, b) => b.name.localeCompare(a.name));
    return copy;
  }, [items, sort]);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border shadow-sm transition-all duration-500",
        cardVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]",
      )}
    >
      <div className="relative h-28 sm:h-32 overflow-hidden">
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover brightness-[0.55] saturate-[1.15] scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package size={36} strokeWidth={1} className="text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              {cfg.icon}
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-white leading-tight capitalize tracking-tight">
                {category}
              </div>
              <div className="text-[10px] sm:text-[11px] text-white/65 font-medium mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground border-0 text-xs font-bold rounded-full px-2.5">
            {items.length}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3.5 sm:p-4 flex flex-wrap gap-1.5 border-t border-border">
        {sorted.map((item, i) => (
          <ItemChip key={item._id} name={item.name} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── SubsidyBanner ─────────────────────────────────────────────────────────────

function SubsidyBanner({ total, cats }: { total: number; cats: number }) {
  return (
    <div className="bg-primary rounded-2xl px-5 sm:px-6 py-5 sm:py-6 grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-5 shadow-xl relative overflow-hidden">
      {/* decorative circles */}
      <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-14 bottom-[-50px] w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <ShieldCheck size={22} className="text-primary-foreground" />
        </div>
        <div>
          <div className="font-extrabold text-sm sm:text-base text-primary-foreground mb-1 tracking-tight">
            Your subsidy covers all items below
          </div>
          <div className="text-xs sm:text-[13px] leading-relaxed text-white/70">
            Use your pack's free subsidy on any of these products at checkout.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div className="font-black text-3xl sm:text-4xl text-primary-foreground tracking-[-1.5px] leading-none">
          {total - 3}
        </div>
        <div className="text-[10px] sm:text-[11px] text-white/65 font-semibold uppercase tracking-widest text-right">
          items · {cats} cats
        </div>
      </div>
    </div>
  );
}

// ─── SortToggle ────────────────────────────────────────────────────────────────

function SortToggle({ sort, onChange }: { sort: SortOrder; onChange: (s: SortOrder) => void }) {
  const options: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
    { value: "default", label: "Default", icon: <Tag size={11} /> },
    { value: "az", label: "A → Z", icon: <ArrowUp size={11} /> },
    { value: "za", label: "Z → A", icon: <ArrowDown size={11} /> },
  ];

  return (
    <div className="flex bg-secondary border border-border rounded-xl p-1 gap-0.5 shrink-0">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-all duration-200 cursor-pointer border-0",
            sort === o.value
              ? "bg-card shadow-sm text-primary font-bold"
              : "text-muted-foreground font-medium bg-transparent",
          )}
        >
          {o.icon}
          <span className="hidden xs:inline sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SubsidyItemsClient({ items }: { items: SubsidyItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("default");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 40);
    return () => clearTimeout(t);
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, SubsidyItem[]> = {};
    for (const item of items) {
      if (!g[item.category]) g[item.category] = [];
      g[item.category].push(item);
    }
    return g;
  }, [items]);

  const categoryKeys = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const q = search.toLowerCase().trim();

  const filteredKeys = useMemo(() => {
    if (!q) return categoryKeys;
    return categoryKeys.filter((cat) => {
      if (cat.toLowerCase().includes(q)) return true;
      return grouped[cat].some((i) => i.name.toLowerCase().includes(q));
    });
  }, [q, categoryKeys, grouped]);

  const getItems = (cat: string): SubsidyItem[] => {
    if (!q) return grouped[cat];
    return grouped[cat].filter(
      (i) => i.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q),
    );
  };

  const fadeStyle = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
  });

  return (
    <div className="w-full min-h-screen pb-20 px-0">

      {/* Header */}
      <div className="mb-5 sm:mb-6" style={fadeStyle(0.07)}>
        <div className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-full px-3.5 py-1 mb-3.5">
          <Sparkles size={11} className="text-primary" />
          <span className="font-bold text-[10px] text-secondary-foreground tracking-widest uppercase">
            Subsidy Programme
          </span>
        </div>

        <h1 className="font-extrabold text-3xl sm:text-4xl text-foreground mb-2.5 tracking-tight leading-tight">
          Subsidised Items
        </h1>

        <p className="text-muted-foreground text-sm sm:text-[14px] max-w-md leading-relaxed">
          Every item listed here is eligible for your pack's free subsidy at checkout.
        </p>
      </div>

      {/* Banner */}
      <div className="mb-4 sm:mb-5" style={fadeStyle(0.12)}>
        <SubsidyBanner total={items.length} cats={categoryKeys.length} />
      </div>

      {/* Search + Sort */}
      <div
        className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 mb-6 items-stretch xs:items-center"
        style={fadeStyle(0.16)}
      >
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
          />
          <Input
            placeholder="Search items or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-card border-border focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
        <SortToggle sort={sort} onChange={setSort} />
      </div>

      {/* Empty state */}
      {filteredKeys.length === 0 && (
        <div className="text-center py-16 sm:py-20 text-muted-foreground">
          <ShoppingBasket size={40} strokeWidth={1} className="mb-3.5 opacity-30 mx-auto" />
          <div className="text-base font-bold text-foreground mb-1.5 tracking-tight">
            No results found
          </div>
          <div className="text-sm">
            Nothing matched <strong className="text-foreground">"{search}"</strong>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredKeys.map((cat, i) => {
          const catItems = getItems(cat);
          if (!catItems.length) return null;

          const isSpecial = SPECIAL_CATEGORIES.includes(cat.toLowerCase());

          return isSpecial ? (
            <AllItemsBanner key={cat} category={cat} index={i} />
          ) : (
            <CategoryCard key={cat} category={cat} items={catItems} sort={sort} index={i} />
          );
        })}
      </div>
    </div>
  );
}