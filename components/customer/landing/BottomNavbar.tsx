"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, User, ScanLine, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

const navItems = [
  { label: "Home", href: "/customer", icon: Home, exact: true },
  { label: "Budget Packs", href: "/customer/budget-packs", icon: PackageCheck },
  { label: "Scan", href: "/customer/search?scan=1", icon: ScanLine },
  { label: "Analytics", href: "/customer/analytics", icon: BarChart2 },
  { label: "Profile", href: "/customer/profile", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = navItems.findIndex(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href)
  );

  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const activeItem = itemRefs.current[activeIndex];
    if (!nav || !pill || !activeItem) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    // Center the 48px pill over the icon area
    const pillLeft = itemRect.left - navRect.left + itemRect.width / 2 - 24;
    pill.style.transform = `translateX(${pillLeft}px)`;
  }, [activeIndex]);

  return (
    <>
      <div className="h-20 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div ref={navRef} className="relative flex items-center justify-around px-2 py-2">

          {/* The single sliding pill — lives behind all items */}
          <span
            ref={pillRef}
            className="pointer-events-none absolute left-0 top-2 h-10 w-12 rounded-2xl bg-[#16a34a] shadow-[0_4px_16px_rgba(22,163,74,0.35)]"
            style={{ transition: "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />

          {navItems.map(({ label, href, icon: Icon, exact }, i) => {
            const active = activeIndex === i;

            return (
              <Link
                key={href}
                href={href}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="relative z-10 flex flex-col items-center justify-center flex-1 gap-1 min-w-0 select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="flex items-center justify-center w-12 h-10">
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.75}
                    className={cn(
                      "transition-colors duration-150",
                      active ? "text-white" : "text-gray-400"
                    )}
                  />
                </span>

                <span
                  className={cn(
                    "text-[10px] leading-none font-semibold tracking-wide transition-colors duration-150",
                    active ? "text-[#15803d]" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}