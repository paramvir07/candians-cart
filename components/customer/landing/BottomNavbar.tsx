"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, BarChart2, User, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/customer", icon: Home, exact: true },
  { label: "Orders", href: "/customer/orders", icon: ShoppingBag },
  //   { label: "Search", href: "/customer/search", icon: Search },
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
      {/* Spacer so page content isn't clipped by the floating bar */}
      <div className="h-24 md:hidden" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* Floating pill */}
        <div
          className={cn(
            "flex items-center justify-around",
            "bg-white rounded-[28px]",
            "px-2 py-2",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]",
            "border border-gray-100/80",
          )}
        >
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

                  {/* Pulse ring on active — fires once */}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-2xl bg-[#16a34a]/20"
                      style={{
                        animation:
                          "ping 0.6s cubic-bezier(0,0,0.2,1) 1 forwards",
                      }}
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
