"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowLeft, Search, Sparkles, ShieldCheck,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronRight,
  Package, Leaf, Milk, Apple, ShoppingBasket,
  Wheat, Fish, Beef, Cookie, Droplets, FlameKindling,
  Salad, Bean, Tag,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubsidyItem {
  _id: string;
  name: string;
  category: string;
}

type SortOrder = "az" | "za" | "default";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; img: string }> = {
  "oil & ghee": {
    icon: <FlameKindling size={15} />,
    img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=240&fit=crop&auto=format&q=75",
  },
  "flour & atta": {
    icon: <Wheat size={15} />,
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=240&fit=crop&auto=format&q=75",
  },
  fruits: {
    icon: <Apple size={15} />,
    img: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=240&fit=crop&auto=format&q=75",
  },
  vegetables: {
    icon: <Leaf size={15} />,
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=240&fit=crop&auto=format&q=75",
  },
  dairy: {
    icon: <Milk size={15} />,
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=240&fit=crop&auto=format&q=75",
  },
  meat: {
    icon: <Beef size={15} />,
    img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=240&fit=crop&auto=format&q=75",
  },
  seafood: {
    icon: <Fish size={15} />,
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=240&fit=crop&auto=format&q=75",
  },
  grains: {
    icon: <Wheat size={15} />,
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=240&fit=crop&auto=format&q=75",
  },
  bakery: {
    icon: <Cookie size={15} />,
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=240&fit=crop&auto=format&q=75",
  },
  beverages: {
    icon: <Droplets size={15} />,
    img: "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=400&h=240&fit=crop&auto=format&q=75",
  },
  snacks: {
    icon: <Cookie size={15} />,
    img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=240&fit=crop&auto=format&q=75",
  },
  lentils: {
    icon: <Bean size={15} />,
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=240&fit=crop&auto=format&q=75",
  },
  salads: {
    icon: <Salad size={15} />,
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=240&fit=crop&auto=format&q=75",
  },
};

function getCategoryConfig(cat: string) {
  const lower = cat.toLowerCase();
  for (const [key, cfg] of Object.entries(CATEGORY_CONFIG)) {
    if (lower.includes(key)) return cfg;
  }
  return {
    icon: <ShoppingBasket size={15} />,
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=240&fit=crop&auto=format&q=75",
  };
}

// ─── Item Chip ────────────────────────────────────────────────────────────────

function ItemChip({ name, index }: { name: string; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 35);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "6px 12px 6px 8px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.95)",
        transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.4,0.64,1)",
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--primary)", flexShrink: 0,
      }} />
      <span style={{
        fontSize: 12, fontWeight: 500,
        color: "var(--foreground)",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {name.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

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
  const [expanded, setExpanded]     = useState(true);
  const [imgErr, setImgErr]         = useState(false);
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
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--border)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* Image header */}
      <div style={{ position: "relative", height: 100, overflow: "hidden" }}>
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "brightness(0.72) saturate(1.1)",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "var(--secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={32} strokeWidth={1.2} color="var(--muted-foreground)" />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, var(--card) 0%, transparent 60%)",
        }} />

        {/* Category label over image */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary-foreground)",
              flexShrink: 0,
              boxShadow: "0 2px 8px oklch(0.6271 0.1699 149.2138 / 0.4)",
            }}>
              {cfg.icon}
            </div>
            <div>
              <div style={{
                fontWeight: 700, fontSize: 14,
                color: "var(--foreground)", lineHeight: 1.2,
              }}>
                {category}
              </div>
              <div style={{
                fontSize: 11, color: "var(--muted-foreground)", marginTop: 1,
              }}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
              transition: "all 0.2s",
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              size={13}
              color="var(--muted-foreground)"
              style={{
                transition: "transform 0.25s ease",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Items */}
      {expanded && (
        <div style={{
          padding: "12px 16px 16px",
          display: "flex", flexWrap: "wrap", gap: 7,
          borderTop: "1px solid var(--border)",
        }}>
          {sorted.map((item, i) => (
            <ItemChip key={item._id} name={item.name} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function SubsidyBanner({ total, cats }: { total: number; cats: number }) {
  return (
    <div style={{
      background: "var(--primary)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 24px",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      alignItems: "center",
      gap: 16,
      boxShadow: "var(--shadow-lg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* decorative circles */}
      <div style={{
        position: "absolute", right: -32, top: -32,
        width: 110, height: 110, borderRadius: "50%",
        background: "oklch(1 0 0 / 0.07)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 40, bottom: -40,
        width: 80, height: 80, borderRadius: "50%",
        background: "oklch(1 0 0 / 0.05)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "var(--radius-sm)",
          background: "oklch(1 0 0 / 0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <ShieldCheck size={21} color="var(--primary-foreground)" />
        </div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 14,
            color: "var(--primary-foreground)", marginBottom: 4,
            letterSpacing: -0.3,
          }}>
            Your subsidy covers all items below
          </div>
          <div style={{
            fontSize: 13, lineHeight: 1.6,
            color: "oklch(1 0 0 / 0.75)",
          }}>
            Use your pack's free credit on any of these products at checkout.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
        flexShrink: 0,
      }}>
        <div style={{
          fontWeight: 900, fontSize: 28,
          color: "var(--primary-foreground)",
          letterSpacing: -1, lineHeight: 1,
        }}>{total}</div>
        <div style={{
          fontSize: 11, color: "oklch(1 0 0 / 0.65)",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          items · {cats} categories
        </div>
      </div>
    </div>
  );
}

// ─── Sort Toggle ──────────────────────────────────────────────────────────────

function SortToggle({ sort, onChange }: { sort: SortOrder; onChange: (s: SortOrder) => void }) {
  const options: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
    { value: "default", label: "Default",   icon: <Tag size={12} /> },
    { value: "az",      label: "A → Z",     icon: <ArrowUp size={12} /> },
    { value: "za",      label: "Z → A",     icon: <ArrowDown size={12} /> },
  ];

  return (
    <div style={{
      display: "flex",
      background: "var(--secondary)",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: 3, gap: 2,
    }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 11px",
            borderRadius: "calc(var(--radius-sm) - 2px)",
            border: "none",
            background: sort === o.value ? "var(--card)" : "transparent",
            boxShadow: sort === o.value ? "var(--shadow-xs)" : "none",
            color: sort === o.value ? "var(--primary)" : "var(--muted-foreground)",
            fontWeight: sort === o.value ? 700 : 500,
            fontSize: 12, cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubsidyItemsClient({ items }: { items: SubsidyItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<SortOrder>("default");
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Group by category
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
    return categoryKeys.filter(cat => {
      if (cat.toLowerCase().includes(q)) return true;
      return grouped[cat].some(i => i.name.toLowerCase().includes(q));
    });
  }, [q, categoryKeys, grouped]);

  const getItems = (cat: string): SubsidyItem[] => {
    if (!q) return grouped[cat];
    return grouped[cat].filter(i =>
      i.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q)
    );
  };

  const fade = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
  });

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--background)",
      maxWidth: 900, margin: "0 auto",
      padding: "28px 16px 80px",
    }}>

      {/* Back */}
      <div style={{ marginBottom: 24, ...fade(0) }}>
        <Link href="/customer/budget-packs" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--card)", border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "8px 15px",
            fontWeight: 600, fontSize: 13,
            color: "var(--foreground)", cursor: "pointer",
            boxShadow: "var(--shadow-xs)", transition: "all 0.2s",
          }}>
            <ArrowLeft size={14} />
            Back to Packs
          </button>
        </Link>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: 22, ...fade(0.06) }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--secondary)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "4px 13px", marginBottom: 12,
        }}>
          <Sparkles size={11} color="var(--primary)" />
          <span style={{
            fontWeight: 700, fontSize: 10,
            color: "var(--secondary-foreground)",
            letterSpacing: 1, textTransform: "uppercase",
          }}>Subsidy Programme</span>
        </div>

        <h1 style={{
          fontWeight: 800,
          fontSize: "clamp(26px, 4vw, 38px)",
          color: "var(--foreground)",
          margin: "0 0 8px",
          letterSpacing: -1.2, lineHeight: 1.05,
        }}>
          Subsidised Items
        </h1>

        <p style={{
          color: "var(--muted-foreground)",
          fontSize: 14, margin: 0,
          maxWidth: 420, lineHeight: 1.7,
        }}>
          Every item listed here is eligible for your pack's free credit at checkout.
        </p>
      </div>

      {/* Banner */}
      <div style={{ marginBottom: 18, ...fade(0.1) }}>
        <SubsidyBanner total={items.length} cats={categoryKeys.length} />
      </div>

      {/* Search + Sort */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 22,
        flexWrap: "wrap", alignItems: "center",
        ...fade(0.14),
      }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} color="var(--muted-foreground)" style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder="Search items or categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--input)",
              fontSize: 13, color: "var(--foreground)",
              background: "var(--card)", outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={e => {
              e.target.style.borderColor = "var(--ring)";
              e.target.style.boxShadow = "0 0 0 3px oklch(0.6271 0.1699 149.2138 / 0.15)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--input)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <SortToggle sort={sort} onChange={setSort} />
      </div>

      {/* Empty state */}
      {filteredKeys.length === 0 && (
        <div style={{
          textAlign: "center", padding: "64px 0",
          color: "var(--muted-foreground)",
        }}>
          <ShoppingBasket size={36} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
            No results
          </div>
          <div style={{ fontSize: 13 }}>
            Nothing matched "<strong style={{ color: "var(--foreground)" }}>{search}</strong>"
          </div>
        </div>
      )}

      {/* Category cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 14,
      }}>
        {filteredKeys.map((cat, i) => {
          const catItems = getItems(cat);
          if (!catItems.length) return null;
          return (
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