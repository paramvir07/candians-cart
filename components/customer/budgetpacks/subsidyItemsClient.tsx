"use client";

// app/customer/(customer)/budget-packs/subsidy-items/SubsidyItemsClient.tsx

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Search, Sparkles, ShieldCheck,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronRight,
  Package, Leaf, Milk, Apple, ShoppingBasket, Wheat, Fish, Beef, Cookie, Droplets,
  Tag,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: boolean;
  subsidised: boolean;
  images?: { url: string; fileId: string }[];
}

type SortOrder = "default" | "asc" | "desc";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Category fallback stock images (stable Unsplash photo IDs) ───────────────
// Format: https://images.unsplash.com/photo-{id}?w=300&h=220&fit=crop&auto=format&q=70

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  fruits:
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=220&fit=crop&auto=format&q=70",
  fruit:
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=220&fit=crop&auto=format&q=70",
  vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=220&fit=crop&auto=format&q=70",
  vegetable:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=220&fit=crop&auto=format&q=70",
  dairy:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=220&fit=crop&auto=format&q=70",
  meat:
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=220&fit=crop&auto=format&q=70",
  seafood:
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=220&fit=crop&auto=format&q=70",
  fish:
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=220&fit=crop&auto=format&q=70",
  grains:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=220&fit=crop&auto=format&q=70",
  grain:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=220&fit=crop&auto=format&q=70",
  bakery:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=220&fit=crop&auto=format&q=70",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=220&fit=crop&auto=format&q=70",
  beverages:
    "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=300&h=220&fit=crop&auto=format&q=70",
  beverage:
    "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=300&h=220&fit=crop&auto=format&q=70",
  drinks:
    "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=300&h=220&fit=crop&auto=format&q=70",
  snacks:
    "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=220&fit=crop&auto=format&q=70",
  snack:
    "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=220&fit=crop&auto=format&q=70",
  frozen:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=220&fit=crop&auto=format&q=70",
  canned:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=220&fit=crop&auto=format&q=70",
  condiments:
    "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=220&fit=crop&auto=format&q=70",
  spices:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=220&fit=crop&auto=format&q=70",
  herbs:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=220&fit=crop&auto=format&q=70",
  eggs:
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=220&fit=crop&auto=format&q=70",
  nuts:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=220&fit=crop&auto=format&q=70",
  oils:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=220&fit=crop&auto=format&q=70",
  // generic grocery fallback
  default:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=220&fit=crop&auto=format&q=70",
};

function getCategoryFallbackImage(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return CATEGORY_FALLBACK_IMAGES.default;
}

// ─── Category Icon Map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fruits:     <Apple size={14} />,
  fruit:      <Apple size={14} />,
  vegetables: <Leaf size={14} />,
  vegetable:  <Leaf size={14} />,
  dairy:      <Milk size={14} />,
  meat:       <Beef size={14} />,
  seafood:    <Fish size={14} />,
  fish:       <Fish size={14} />,
  grains:     <Wheat size={14} />,
  grain:      <Wheat size={14} />,
  bakery:     <Wheat size={14} />,
  beverages:  <Droplets size={14} />,
  beverage:   <Droplets size={14} />,
  drinks:     <Droplets size={14} />,
  snacks:     <Cookie size={14} />,
  snack:      <Cookie size={14} />,
};

function getCategoryIcon(cat: string) {
  const lower = cat.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <ShoppingBasket size={14} />;
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, index }: { item: Product; index: number }) {
  const [visible, setVisible]       = useState(false);
  const [imgErr, setImgErr]         = useState(false);
  const [fallbackErr, setFbErr]     = useState(false);

  // Priority: product image → category stock image → solid fallback bg
  const hasProductImg = !imgErr && !!item.images?.[0]?.url;
  const fallbackUrl   = getCategoryFallbackImage(item.category);
  const imgSrc        = hasProductImg
    ? item.images![0].url
    : !fallbackErr ? fallbackUrl : null;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40 + index * 50);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div style={{
      width: 152,
      flexShrink: 0,
      borderRadius: "var(--radius)",
      background: item.stock ? "var(--card)" : "var(--muted)",
      border: "1.5px solid var(--border)",
      overflow: "hidden",
      opacity: visible ? (item.stock ? 1 : 0.45) : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
      transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
      boxShadow: item.stock ? "var(--shadow-sm)" : "none",
    }}>
      {/* Image */}
      <div style={{
        width: "100%", height: 112,
        background: "var(--secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => {
              if (hasProductImg) setImgErr(true);
              else setFbErr(true);
            }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: item.stock ? "none" : "grayscale(0.7) opacity(0.5)",
            }}
          />
        ) : (
          // Final fallback: icon on tinted bg
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 5,
            color: "var(--muted-foreground)",
          }}>
            <Package size={26} strokeWidth={1.5} />
          </div>
        )}

        {/* Subsidised badge */}
        {item.stock && item.price > 0 && (
          <div style={{
            position: "absolute", top: 7, right: 7,
            background: "var(--primary)",
            borderRadius: 999, padding: "2px 7px",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <Sparkles size={8} color="var(--primary-foreground)" />
            <span style={{
              fontSize: 9, color: "var(--primary-foreground)",
              fontWeight: 700, letterSpacing: 0.3,
            }}>Subsidised</span>
          </div>
        )}

        {!item.stock && (
          <div style={{
            position: "absolute", inset: 0,
            background: "oklch(0.9719 0.0055 158.5966 / 0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 10, color: "var(--muted-foreground)", fontWeight: 700,
              background: "var(--card)", padding: "3px 9px",
              borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
            }}>Out of stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "9px 10px 11px" }}>
        <div style={{
          fontWeight: 600, fontSize: 12,
          color: item.stock ? "var(--foreground)" : "var(--muted-foreground)",
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: 5,
          textTransform: "capitalize",
          minHeight: 32,
        }}>
          {item.name.toLowerCase()}
        </div>

        {item.stock && item.price > 0 ? (
          <div style={{
            fontWeight: 800, fontSize: 14,
            color: "var(--primary)", letterSpacing: -0.4,
          }}>
            {formatPrice(item.price)}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
        )}
      </div>
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

function CategoryRow({ category, items, sort }: {
  category: string; items: Product[]; sort: SortOrder;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canRight, setCanRight] = useState(false);

  const sorted = [...items].sort((a, b) => {
    if (sort === "asc")  return a.price - b.price;
    if (sort === "desc") return b.price - a.price;
    if (a.stock && !b.stock) return -1;
    if (!a.stock && b.stock)  return 1;
    return 0;
  });

  const inStock = items.filter(i => i.stock && i.price > 0).length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [items]);

  return (
    <div style={{
      background: "var(--card)",
      borderRadius: "var(--radius-lg)",
      border: "1.5px solid var(--border)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 18px 11px",
        borderBottom: "1px solid var(--border)",
        background: "var(--secondary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent-foreground)",
          }}>
            {getCategoryIcon(category)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>
              {category}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
              {inStock} item{inStock !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>

        {canRight && (
          <button
            onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" })}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "var(--accent)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "5px 10px",
              fontWeight: 600, fontSize: 11,
              color: "var(--accent-foreground)", cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            More <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Scroll track */}
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: "flex", gap: 10,
            overflowX: "auto", padding: "14px 18px 16px",
          }}
        >
          {sorted.map((item, i) => (
            <ItemCard key={item._id} item={item} index={i} />
          ))}
        </div>

        {canRight && (
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 52,
            background: "linear-gradient(to left, var(--card) 40%, transparent)",
            pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Fully Covered Banner ─────────────────────────────────────────────────────

function FullyCoveredBanner() {
  return (
    <div style={{
      background: "var(--primary)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 20px",
      display: "flex", alignItems: "flex-start", gap: 14,
      boxShadow: "var(--shadow-md)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: -24, top: -24,
        width: 96, height: 96, borderRadius: "50%",
        background: "oklch(1 0 0 / 0.06)", pointerEvents: "none",
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-sm)",
        background: "oklch(1 0 0 / 0.12)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <ShieldCheck size={20} color="var(--primary-foreground)" />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: "var(--primary-foreground)", marginBottom: 4 }}>
          Fruits, Vegetables &amp; Dairy — 100% subsidised
        </div>
        <div style={{ fontSize: 13, color: "oklch(1 0 0 / 0.8)", lineHeight: 1.6 }}>
          Every item in these sections is fully covered by your gift wallet credit. Shop freely.
        </div>
      </div>
    </div>
  );
}

// ─── Sort Button ──────────────────────────────────────────────────────────────

function SortButton({ sort, onChange }: { sort: SortOrder; onChange: (s: SortOrder) => void }) {
  const cycle = () => {
    if (sort === "default") onChange("asc");
    else if (sort === "asc") onChange("desc");
    else onChange("default");
  };
  const Icon  = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown;
  const label = sort === "asc" ? "Low → High" : sort === "desc" ? "High → Low" : "Sort";
  const active = sort !== "default";

  return (
    <button
      onClick={cycle}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: active ? "var(--secondary)" : "var(--card)",
        border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-sm)", padding: "9px 14px",
        fontWeight: 600, fontSize: 13,
        color: active ? "var(--primary)" : "var(--muted-foreground)",
        cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ grouped, categoryKeys }: {
  grouped: Record<string, Product[]>; categoryKeys: string[];
}) {
  const total   = Object.values(grouped).flat().length;
  const inStock = Object.values(grouped).flat().filter(i => i.stock).length;
  const cats    = categoryKeys.length;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {([
        { label: "Total items", value: `${total}+` },
        { label: "In stock",    value: inStock },
        { label: "Categories",  value: cats },
      ] as const).map(s => (
        <div key={s.label} style={{
          flex: 1,
          background: "var(--card)", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius)", padding: "10px 12px",
          textAlign: "center", boxShadow: "var(--shadow-xs)",
        }}>
          <div style={{
            fontWeight: 800, fontSize: 20,
            color: "var(--primary)", letterSpacing: -0.6,
          }}>{s.value}</div>
          <div style={{
            fontSize: 11, color: "var(--muted-foreground)",
            fontWeight: 500, marginTop: 2,
          }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubsidyItemsClient({
  grouped,
  categoryKeys,
}: {
  grouped: Record<string, Product[]>;
  categoryKeys: string[];
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<SortOrder>("default");
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 30);
    return () => clearTimeout(t);
  }, []);

  const q = search.toLowerCase();

  const filteredCategories = categoryKeys.filter(cat => {
    if (!q) return true;
    if (cat.toLowerCase().includes(q)) return true;
    return grouped[cat].some(item => item.name.toLowerCase().includes(q));
  });

  const getItems = (cat: string) => {
    if (!q) return grouped[cat];
    return grouped[cat].filter(item =>
      item.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q)
    );
  };

  const fade = (delay = 0): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
  });

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--background)",
      maxWidth: 1060, margin: "0 auto",
      padding: "28px 14px 72px",
    }}>

      {/* Back */}
      <div style={{ marginBottom: 28, ...fade(0) }}>
        <Link href="/customer/budget-packs" style={{ textDecoration: "none" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "var(--card)", border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "9px 16px",
            fontWeight: 600, fontSize: 13,
            color: "var(--foreground)", cursor: "pointer",
            boxShadow: "var(--shadow-xs)", transition: "all 0.2s",
          }}>
            <ArrowLeft size={15} />
            Back to Packs
          </button>
        </Link>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: 26, ...fade(0.05) }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--secondary)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "5px 14px", marginBottom: 14,
        }}>
          <Tag size={12} color="var(--primary)" />
          <span style={{
            fontWeight: 700, fontSize: 11,
            color: "var(--secondary-foreground)",
            letterSpacing: 0.8, textTransform: "uppercase",
          }}>Subsidised Items</span>
        </div>

        <h1 style={{
          fontWeight: 800, fontSize: "clamp(24px,4vw,36px)",
          color: "var(--foreground)",
          margin: "0 0 10px", letterSpacing: -1, lineHeight: 1.1,
        }}>
          All Subsidised Items
        </h1>

        <p style={{
          color: "var(--muted-foreground)",
          fontSize: "clamp(13px,2vw,15px)",
          margin: 0, maxWidth: 440, lineHeight: 1.7,
        }}>
          Your gift wallet credit applies to everything listed below.
        </p>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 14, ...fade(0.1) }}>
        <StatsBar grouped={grouped} categoryKeys={categoryKeys} />
      </div>

      {/* Banner */}
      <div style={{ marginBottom: 16, ...fade(0.13) }}>
        <FullyCoveredBanner />
      </div>

      {/* Search + Sort */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap",
        ...fade(0.16),
      }}>
        <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
          <Search size={14} color="var(--muted-foreground)" style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder="Search items or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 35px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--input)",
              fontSize: 14, color: "var(--foreground)",
              background: "var(--card)", outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
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
        <SortButton sort={sort} onChange={setSort} />
      </div>

      {/* Empty */}
      {filteredCategories.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 0",
          color: "var(--muted-foreground)", fontSize: 15,
        }}>
          No items found for "<strong style={{ color: "var(--foreground)" }}>{search}</strong>"
        </div>
      )}

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredCategories.map(cat => {
          const items = getItems(cat);
          if (!items.length) return null;
          return <CategoryRow key={cat} category={cat} items={items} sort={sort} />;
        })}
      </div>

    </main>
  );
}