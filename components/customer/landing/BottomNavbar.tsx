"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, BarChart2, User, ScanLine, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/customer", icon: Home, exact: true },
  { label: "Budget Packs", href: "/customer/budget-packs", icon: PackageCheck },
  { label: "Scan", href: "/customer/search?scan=1", icon: ScanLine },
  { label: "Analytics", href: "/customer/analytics", icon: BarChart2 },
  { label: "Profile", href: "/customer/profile", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Spacer — accounts for nav height + safe area */}
      <div className="h-20 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);

            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center flex-1 gap-1 min-w-0 select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* Icon pill */}
                <span
                  className={cn(
                    "relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-300 ease-out",
                    active
                      ? "bg-[#16a34a] shadow-[0_4px_16px_rgba(22,163,74,0.4)] scale-[1.08]"
                      : "bg-transparent active:scale-95 active:bg-gray-50",
                  )}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.75}
                    className={cn(
                      "transition-all duration-300",
                      active ? "text-white" : "text-gray-400",
                    )}
                  />

                  {active && (
                    <span
                      className="absolute inset-0 rounded-2xl bg-[#16a34a]/20"
                      style={{ animation: "ping 0.6s cubic-bezier(0,0,0.2,1) 1 forwards" }}
                    />
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] leading-none font-semibold tracking-wide transition-colors duration-300",
                    active ? "text-[#15803d]" : "text-gray-400",
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