"use client";

import { SubsidyItem } from "@/types/admin/subsidyList.types";
import { useState, useMemo } from "react";

interface SubsidyListViewProps {
  items?: SubsidyItem[];
  /** Render action buttons inside each item card (admin only) */
  renderItemActions?: (item: SubsidyItem) => React.ReactNode;
  /** Render an expanded panel below a card, e.g. edit form or delete confirm */
  renderItemExpanded?: (item: SubsidyItem) => React.ReactNode;
}

function getCategoryStyle(category: string) {
  const palettes = [
    {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-400",
      border: "border-emerald-200",
    },
    {
      bg: "bg-sky-50",
      text: "text-sky-700",
      dot: "bg-sky-400",
      border: "border-sky-200",
    },
    {
      bg: "bg-violet-50",
      text: "text-violet-700",
      dot: "bg-violet-400",
      border: "border-violet-200",
    },
    {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400",
      border: "border-amber-200",
    },
    {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-400",
      border: "border-rose-200",
    },
    {
      bg: "bg-teal-50",
      text: "text-teal-700",
      dot: "bg-teal-400",
      border: "border-teal-200",
    },
    {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-400",
      border: "border-orange-200",
    },
    {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      dot: "bg-indigo-400",
      border: "border-indigo-200",
    },
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++)
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

export default function SubsidyListView({
  items = [],
  renderItemActions,
  renderItemExpanded,
}: SubsidyListViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categoryList = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category))).sort();
    return ["all", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all") return { [activeCategory]: filtered };
    return filtered.reduce<Record<string, SubsidyItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered, activeCategory]);

  const hasActions = !!renderItemActions;

  return (
    <div className="w-full space-y-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search subsidy items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categoryList.map((cat) => {
          const style = cat === "all" ? null : getCategoryStyle(cat);
          const isActive = activeCategory === cat;
          const count =
            cat === "all"
              ? items.length
              : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all
                ${
                  isActive
                    ? cat === "all"
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : `${style!.bg} ${style!.text} border-transparent ring-2 ring-offset-1 ring-current shadow-sm`
                    : cat === "all"
                      ? "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      : `bg-white ${style!.text} border-slate-200 hover:${style!.bg} hover:border-transparent`
                }`}
            >
              {cat !== "all" && (
                <span className={`w-1.5 h-1.5 rounded-full ${style!.dot}`} />
              )}
              <span className="capitalize">{cat}</span>
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-600">{filtered.length}</span> of{" "}
        <span className="font-medium text-slate-600">{items.length}</span> items
        {search && (
          <>
            {" "}
            for &ldquo;
            <span className="text-slate-700 font-medium">{search}</span>&rdquo;
          </>
        )}
      </p>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg
            className="w-10 h-10 mb-3 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm font-medium">No items found</p>
          <p className="text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, groupItems]) => {
            const style = getCategoryStyle(category);
            return (
              <div key={category}>
                {activeCategory === "all" && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <h3
                      className={`text-xs font-semibold uppercase tracking-widest ${style.text}`}
                    >
                      {category}
                    </h3>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${style.bg} ${style.text}`}
                    >
                      {groupItems.length}
                    </span>
                    <div className={`flex-1 h-px ${style.bg}`} />
                  </div>
                )}

                {/* Grid: wider cards when actions are present */}
                <div
                  className={`grid gap-2 ${hasActions ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
                >
                  {groupItems.map((item) => (
                    <div key={item._id}>
                      {/* Card */}
                      <div
                        className={`group flex items-center gap-3 p-3 rounded-xl border ${style.border} ${style.bg} transition-all`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 ${style.text}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${style.text} truncate`}
                          >
                            {item.name}
                          </p>
                          {activeCategory !== "all" && (
                            <p className="text-xs text-slate-400 capitalize">
                              {item.category}
                            </p>
                          )}
                        </div>
                        {renderItemActions?.(item)}
                      </div>

                      {/* Expanded panel (edit / delete confirm) */}
                      {renderItemExpanded?.(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
