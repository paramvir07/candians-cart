"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft, Search, Sparkles, ShieldCheck,
  ArrowUp, ArrowDown,
  Package, Leaf, Milk, Apple, ShoppingBasket,
  Wheat, Fish, Beef, Cookie, Droplets, FlameKindling,
  Salad, Bean, Tag, CheckCircle2,
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
    const t = setTimeout(() => setVisible(true), index * 30);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--secondary)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "5px 12px 5px 9px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.93)",
        transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
      }}
    >
      <div style={{
        width: 5, height: 5, borderRadius: "50%",
        background: "var(--primary)", flexShrink: 0,
      }} />
      <span style={{
        fontSize: 12, fontWeight: 500,
        color: "var(--secondary-foreground)",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
        letterSpacing: "0.01em",
      }}>
        {name.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Special Category Banner (Produce / Dairy / full-section) ─────────────────

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
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--border)",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* Hero image – taller for these special categories */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "brightness(0.6) saturate(1.2)",
              transform: "scale(1.04)",
              transition: "transform 6s ease",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "var(--secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={40} strokeWidth={1} color="var(--muted-foreground)" />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, var(--card) 0%, rgba(0,0,0,0.1) 70%)",
        }} />

        {/* "Full Section" badge — top right */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "var(--primary)",
          borderRadius: 999,
          padding: "3px 10px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <CheckCircle2 size={11} color="var(--primary-foreground)" />
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: "var(--primary-foreground)",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>Full section</span>
        </div>

        {/* Category label overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-sm)",
            background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--primary-foreground)",
            flexShrink: 0,
            boxShadow: "0 4px 12px oklch(0.6271 0.1699 149.2138 / 0.45)",
          }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{
              fontWeight: 800, fontSize: 17,
              color: "#fff",
              lineHeight: 1.1,
              textTransform: "capitalize",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              letterSpacing: "-0.02em",
            }}>
              {category}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 2, fontWeight: 500 }}>
              Entire section subsidised
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{
        padding: "14px 18px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
        background: "var(--secondary)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px oklch(0.6271 0.1699 149.2138 / 0.3)",
        }}>
          <CheckCircle2 size={17} color="var(--primary-foreground)" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
            All items covered
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, lineHeight: 1.5 }}>
            Every item in the{" "}
            <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--primary)" }}>{category}</span>{" "}
            section is eligible for subsidy
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Card (toggle removed — always expanded) ──────────────────────────

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
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--border)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* Hero image */}
      <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
        {!imgErr ? (
          <img
            src={cfg.img}
            alt={category}
            onError={() => setImgErr(true)}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "brightness(0.6) saturate(1.15)",
              transform: "scale(1.04)",
              transition: "transform 6s ease",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "var(--secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={36} strokeWidth={1} color="var(--muted-foreground)" />
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, var(--card) 0%, rgba(0,0,0,0.05) 70%)",
        }} />

        {/* Category header overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "var(--radius-sm)",
              background: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary-foreground)",
              flexShrink: 0,
              boxShadow: "0 3px 10px oklch(0.6271 0.1699 149.2138 / 0.45)",
            }}>
              {cfg.icon}
            </div>
            <div>
              <div style={{
                fontWeight: 800, fontSize: 15,
                color: "#fff",
                lineHeight: 1.1,
                textTransform: "capitalize",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                letterSpacing: "-0.02em",
              }}>
                {category}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1, fontWeight: 500 }}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Item count badge */}
          <div style={{
            background: "var(--primary)",
            borderRadius: 999,
            padding: "3px 9px",
            fontSize: 11, fontWeight: 700,
            color: "var(--primary-foreground)",
            letterSpacing: "0.02em",
          }}>
            {items.length}
          </div>
        </div>
      </div>

      {/* Items — always visible, no toggle */}
      <div style={{
        padding: "14px 16px 16px",
        display: "flex", flexWrap: "wrap", gap: 7,
        borderTop: "1px solid var(--border)",
      }}>
        {sorted.map((item, i) => (
          <ItemChip key={item._id} name={item.name} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Stats Banner ──────────────────────────────────────────────────────────────

function SubsidyBanner({ total, cats }: { total: number; cats: number }) {
  return (
    <div style={{
      background: "var(--primary)",
      borderRadius: "var(--radius-lg)",
      padding: "22px 24px",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      alignItems: "center",
      gap: 20,
      boxShadow: "var(--shadow-xl)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{
        position: "absolute", right: -40, top: -40,
        width: 130, height: 130, borderRadius: "50%",
        background: "oklch(1 0 0 / 0.07)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 50, bottom: -50,
        width: 100, height: 100, borderRadius: "50%",
        background: "oklch(1 0 0 / 0.05)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 15 }}>
        <div style={{
          width: 46, height: 46, borderRadius: "var(--radius-sm)",
          background: "oklch(1 0 0 / 0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <ShieldCheck size={23} color="var(--primary-foreground)" />
        </div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 15,
            color: "var(--primary-foreground)", marginBottom: 5,
            letterSpacing: "-0.03em",
          }}>
            Your subsidy covers all items below
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: "oklch(1 0 0 / 0.72)" }}>
            Use your pack's free credit on any of these products at checkout.
          </div>
        </div>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3,
        flexShrink: 0,
      }}>
        <div style={{
          fontWeight: 900, fontSize: 34,
          color: "var(--primary-foreground)",
          letterSpacing: -1.5, lineHeight: 1,
        }}>{total-3}</div>
        <div style={{
          fontSize: 11, color: "oklch(1 0 0 / 0.65)",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          items · {cats} categories
        </div>
      </div>
    </div>
  );
}

// ─── Sort Toggle ───────────────────────────────────────────────────────────────

function SortToggle({ sort, onChange }: { sort: SortOrder; onChange: (s: SortOrder) => void }) {
  const options: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
    { value: "default", label: "Default", icon: <Tag size={11} /> },
    { value: "az",      label: "A → Z",   icon: <ArrowUp size={11} /> },
    { value: "za",      label: "Z → A",   icon: <ArrowDown size={11} /> },
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
            padding: "6px 12px",
            borderRadius: "calc(var(--radius-sm) - 2px)",
            border: "none",
            background: sort === o.value ? "var(--card)" : "transparent",
            boxShadow: sort === o.value ? "var(--shadow-xs)" : "none",
            color: sort === o.value ? "var(--primary)" : "var(--muted-foreground)",
            fontWeight: sort === o.value ? 700 : 500,
            fontSize: 12, cursor: "pointer",
            transition: "all 0.18s ease",
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SubsidyItemsClient({ items }: { items: SubsidyItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<SortOrder>("default");
  const [ready, setReady]   = useState(false);

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
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
  });

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--background)",
      maxWidth: 920, margin: "0 auto",
      padding: "32px 18px 100px",
    }}>

      {/* Back */}
      <div style={{ marginBottom: 28, ...fade(0) }}>
        <Link href="/customer/budget-packs" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "var(--card)", border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "8px 16px",
            fontWeight: 600, fontSize: 13,
            color: "var(--foreground)", cursor: "pointer",
            boxShadow: "var(--shadow-xs)", transition: "all 0.2s",
          }}>
            <ArrowLeft size={14} />
            Back to Packs
          </button>
        </Link>
      </div>

      {/* Hero header */}
      <div style={{ marginBottom: 24, ...fade(0.07) }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--secondary)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "4px 14px", marginBottom: 14,
        }}>
          <Sparkles size={11} color="var(--primary)" />
          <span style={{
            fontWeight: 700, fontSize: 10,
            color: "var(--secondary-foreground)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Subsidy Programme</span>
        </div>

        <h1 style={{
          fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 40px)",
          color: "var(--foreground)",
          margin: "0 0 10px",
          letterSpacing: "-0.04em", lineHeight: 1.05,
        }}>
          Subsidised Items
        </h1>

        <p style={{
          color: "var(--muted-foreground)",
          fontSize: 14, margin: 0,
          maxWidth: 440, lineHeight: 1.75,
        }}>
          Every item listed here is eligible for your pack's free credit at checkout.
        </p>
      </div>

      {/* Stats banner */}
      <div style={{ marginBottom: 20, ...fade(0.12) }}>
        <SubsidyBanner total={items.length} cats={categoryKeys.length} />
      </div>

      {/* Search + Sort */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 26,
        flexWrap: "wrap", alignItems: "center",
        ...fade(0.16),
      }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} color="var(--muted-foreground)" style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder="Search items or categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 38px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--input)",
              fontSize: 13, color: "var(--foreground)",
              background: "var(--card)", outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
              fontFamily: "inherit",
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
          textAlign: "center", padding: "72px 0",
          color: "var(--muted-foreground)",
        }}>
          <ShoppingBasket size={40} strokeWidth={1} style={{ marginBottom: 14, opacity: 0.35 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 5, letterSpacing: "-0.02em" }}>
            No results found
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
        gap: 16,
      }}>
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

    </main>
  );
}