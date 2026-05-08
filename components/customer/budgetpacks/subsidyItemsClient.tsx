"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
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
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SubsidyItem {
  _id: string;
  name: string;
  category: string;
}

type SortOrder = "az" | "za" | "default";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPECIAL_CATEGORIES = [
  "produce",
  "dairy",
  "fruits",
  "vegetables",
];

// ─── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ReactNode; img: string; accent: string }
> = {
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

function ItemChip({
  name,
  index,
}: {
  name: string;
  index: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 30);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="
        inline-flex items-center gap-[6px]
        bg-secondary
        border border-border
        rounded-full
        pl-[9px] pr-3 py-[5px]
        transition-all duration-300
      "
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(8px) scale(0.93)",
      }}
    >
      <div className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />

      <span
        className="
          text-[12px]
          font-medium
          text-secondary-foreground
          capitalize
          whitespace-nowrap
          max-w-[200px]
          overflow-hidden
          text-ellipsis
          tracking-[0.01em]
        "
      >
        {name.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Special Banner ────────────────────────────────────────────────────────────

function AllItemsBanner({
  category,
  index,
}: {
  category: string;
  index: number;
}) {
  const [cardVisible, setCardVisible] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const cfg = getCategoryConfig(category);

  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 60 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="
        bg-card
        rounded-[var(--radius-lg)]
        border border-border
        overflow-hidden
        shadow-lg
        transition-all duration-500
      "
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.97)",
      }}
    >
      <div className="relative h-[160px] overflow-hidden">
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            className="
              w-full h-full object-cover
              brightness-[0.6] saturate-[1.2]
              scale-[1.04]
            "
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Package
              size={40}
              strokeWidth={1}
              color="var(--muted-foreground)"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

        <div className="absolute top-3 right-3 bg-primary rounded-full px-[10px] py-[3px] flex items-center gap-[5px]">
          <CheckCircle2 size={11} color="var(--primary-foreground)" />

          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
            Full section
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-[18px] py-[14px] flex items-center gap-[10px]">
          <div
            className="
              w-9 h-9
              rounded-[var(--radius-sm)]
              bg-primary
              flex items-center justify-center
              text-primary-foreground
              shrink-0
            "
          >
            {cfg.icon}
          </div>

          <div>
            <div
              className="
                font-extrabold
                text-[17px]
                text-white
                leading-[1.1]
                capitalize
                tracking-[-0.02em]
              "
            >
              {category}
            </div>

            <div className="text-[11px] text-white/70 mt-[2px] font-medium">
              Entire section subsidised
            </div>
          </div>
        </div>
      </div>

      <div className="px-[18px] py-[16px] border-t border-border bg-secondary flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <CheckCircle2
            size={17}
            color="var(--primary-foreground)"
          />
        </div>

        <div>
          <div className="text-[13px] font-bold text-foreground tracking-[-0.01em]">
            All items covered
          </div>

          <div className="text-[12px] text-muted-foreground mt-[2px] leading-[1.5]">
            Every item in the{" "}
            <span className="capitalize font-semibold text-primary">
              {category}
            </span>{" "}
            section is eligible for subsidy
          </div>
        </div>
      </div>
    </div>
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

    if (sort === "az") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "za") {
      copy.sort((a, b) => b.name.localeCompare(a.name));
    }

    return copy;
  }, [items, sort]);

  return (
    <div
      className="
        bg-card
        rounded-[var(--radius-lg)]
        border border-border
        overflow-hidden
        shadow-md
        transition-all duration-500
      "
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.97)",
      }}
    >
      <div className="relative h-[120px] overflow-hidden">
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            className="
              w-full h-full object-cover
              brightness-[0.6] saturate-[1.15]
              scale-[1.04]
            "
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Package
              size={36}
              strokeWidth={1}
              color="var(--muted-foreground)"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 py-[10px] flex items-center justify-between">
          <div className="flex items-center gap-[9px]">
            <div
              className="
                w-8 h-8
                rounded-[var(--radius-sm)]
                bg-primary
                flex items-center justify-center
                text-primary-foreground
                shrink-0
              "
            >
              {cfg.icon}
            </div>

            <div>
              <div
                className="
                  font-extrabold
                  text-[15px]
                  text-white
                  leading-[1.1]
                  capitalize
                  tracking-[-0.02em]
                "
              >
                {category}
              </div>

              <div className="text-[11px] text-white/70 mt-[1px] font-medium">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-full px-[9px] py-[3px] text-[11px] font-bold text-primary-foreground">
            {items.length}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-[7px] border-t border-border">
        {sorted.map((item, i) => (
          <ItemChip
            key={item._id}
            name={item.name}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Banner ────────────────────────────────────────────────────────────────────

function SubsidyBanner({
  total,
  cats,
}: {
  total: number;
  cats: number;
}) {
  return (
    <div
      className="
        bg-primary
        rounded-[var(--radius-lg)]
        px-6 py-[22px]
        grid grid-cols-[1fr_auto]
        items-center
        gap-5
        shadow-xl
        relative
        overflow-hidden
      "
    >
      <div className="absolute right-[-40px] top-[-40px] w-[130px] h-[130px] rounded-full bg-white/10 pointer-events-none" />

      <div className="absolute right-[50px] bottom-[-50px] w-[100px] h-[100px] rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-start gap-[15px]">
        <div className="w-[46px] h-[46px] rounded-[var(--radius-sm)] bg-white/15 flex items-center justify-center shrink-0">
          <ShieldCheck
            size={23}
            color="var(--primary-foreground)"
          />
        </div>

        <div>
          <div className="font-extrabold text-[15px] text-primary-foreground mb-[5px] tracking-[-0.03em]">
            Your subsidy covers all items below
          </div>

          <div className="text-[13px] leading-[1.65] text-white/70">
            Use your pack&apos;s free subsidy on any of these
            products at checkout.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-[3px] shrink-0">
        <div className="font-black text-[34px] text-primary-foreground tracking-[-1.5px] leading-none">
          {total - 3}
        </div>

        <div className="text-[11px] text-white/65 font-semibold uppercase tracking-[0.06em]">
          items · {cats} categories
        </div>
      </div>
    </div>
  );
}

// ─── Sort Toggle ───────────────────────────────────────────────────────────────

function SortToggle({
  sort,
  onChange,
}: {
  sort: SortOrder;
  onChange: (s: SortOrder) => void;
}) {
  const options: {
    value: SortOrder;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "default",
      label: "Default",
      icon: <Tag size={11} />,
    },
    {
      value: "az",
      label: "A → Z",
      icon: <ArrowUp size={11} />,
    },
    {
      value: "za",
      label: "Z → A",
      icon: <ArrowDown size={11} />,
    },
  ];

  return (
    <div className="flex bg-secondary border border-border rounded-[var(--radius-sm)] p-[3px] gap-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`
            flex items-center gap-[5px]
            px-3 py-[6px]
            rounded-[calc(var(--radius-sm)-2px)]
            text-[12px]
            whitespace-nowrap
            transition-all duration-200
            ${
              sort === o.value
                ? "bg-card shadow-xs text-primary font-bold"
                : "text-muted-foreground font-medium"
            }
          `}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SubsidyItemsClient({
  items,
}: {
  items: SubsidyItem[];
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<SortOrder>("default");
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

  const categoryKeys = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped]
  );

  const q = search.toLowerCase().trim();

  const filteredKeys = useMemo(() => {
    if (!q) return categoryKeys;

    return categoryKeys.filter((cat) => {
      if (cat.toLowerCase().includes(q)) return true;

      return grouped[cat].some((i) =>
        i.name.toLowerCase().includes(q)
      );
    });
  }, [q, categoryKeys, grouped]);

  const getItems = (cat: string): SubsidyItem[] => {
    if (!q) return grouped[cat];

    return grouped[cat].filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
    );
  };

  const fade = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready
      ? "translateY(0)"
      : "translateY(16px)",
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
  });

  return (
    <main className="min-h-screen bg-[#f0fdf4]  mx-auto px-[18px] pt-8 pb-[100px] ">
      {/* Back */}

      {/* Header */}

      <div className="mb-6" style={fade(0.07)}>
        <div className="inline-flex items-center gap-[6px] bg-secondary border border-border rounded-full px-[14px] py-1 mb-[14px]">
          <Sparkles size={11} color="var(--primary)" />

          <span className="font-bold text-[10px] text-secondary-foreground tracking-[0.1em] uppercase">
            Subsidy Programme
          </span>
        </div>

        <h1
          className="
            font-extrabold
            text-[clamp(28px,4vw,40px)]
            text-foreground
            mb-[10px]
            tracking-[-0.04em]
            leading-[1.05]
          "
        >
          Subsidised Items
        </h1>

        <p className="text-muted-foreground text-[14px] m-0 max-w-[440px] leading-[1.75]">
          Every item listed here is eligible for your
          pack&apos;s free subsidy at checkout.
        </p>
      </div>

      {/* Banner */}

      <div className="mb-5" style={fade(0.12)}>
        <SubsidyBanner
          total={items.length}
          cats={categoryKeys.length}
        />
      </div>

      {/* Search */}

      <div
        className="flex gap-[10px] mb-[26px] flex-wrap items-center"
        style={fade(0.16)}
      >
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={14}
            color="var(--muted-foreground)"
            className="absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none"
          />

          <input
            placeholder="Search items or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              pl-[38px] pr-[14px] py-[10px]
              rounded-[var(--radius-sm)]
              border border-input
              text-[13px]
              text-foreground
              bg-card
              outline-none
              transition-[border-color,box-shadow]
              duration-200
              box-border
              focus:border-ring
              focus:shadow-[0_0_0_3px_oklch(0.6271_0.1699_149.2138_/_0.15)]
            "
          />
        </div>

        <SortToggle
          sort={sort}
          onChange={setSort}
        />
      </div>

      {/* Empty */}

      {filteredKeys.length === 0 && (
        <div className="text-center py-[72px] text-muted-foreground">
          <ShoppingBasket
            size={40}
            strokeWidth={1}
            className="mb-[14px] opacity-35 mx-auto"
          />

          <div className="text-[16px] font-bold text-foreground mb-[5px] tracking-[-0.02em]">
            No results found
          </div>

          <div className="text-[13px]">
            Nothing matched{" "}
            <strong className="text-foreground">
              {search}
            </strong>
          </div>
        </div>
      )}

      {/* Grid */}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4">
        {filteredKeys.map((cat, i) => {
          const catItems = getItems(cat);

          if (!catItems.length) return null;

          const isSpecial = SPECIAL_CATEGORIES.includes(
            cat.toLowerCase()
          );

          return isSpecial ? (
            <AllItemsBanner
              key={cat}
              category={cat}
              index={i}
            />
          ) : (
            <CategoryCard
              key={cat}
              category={cat}
              items={catItems}
              sort={sort}
              index={i}
            />
          );
        })}
      </div>
    </main>
  );
}