"use client";

import {
  Banknote,
  BarChart,
  HandCoins,
  HomeIcon,
  List,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Users2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import LogoutButton from "../shared/LogoutButton";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Logo from "../shared/Logo";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/store", label: "Dashboard", icon: HomeIcon, exact: true },
      { href: "/store/analytics", label: "Analytics", icon: BarChart },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/store/orders", label: "Orders", icon: ShoppingCart },
      { href: "/store/products", label: "Products", icon: Package },
      { href: "/store/subsidy-list", label: "Subsidy List", icon: List },
      { href: "/store/customers", label: "Customers", icon: Users2 },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/store/payouts", label: "Payouts", icon: HandCoins },
      {
        href: "/store/cash-collection",
        label: "Cash Collection",
        icon: Banknote,
      },
      { href: "/store/invoice", label: "Invoices", icon: Receipt },
    ],
  },
] as const;

function useIsActive(href: string, exact?: boolean) {
  const pathname = usePathname();
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}) {
  const active = useIsActive(href, exact);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
      )}
    >
      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0 transition-colors",
          active
            ? "text-emerald-600"
            : "text-gray-400 group-hover:text-gray-600",
        )}
      />
      <span
        className={cn(
          "text-sm font-medium",
          active ? "text-emerald-700" : "text-gray-600",
        )}
      >
        {label}
      </span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      )}
    </Link>
  );
}

function SidebarContent({ onNav, name }: { onNav?: () => void; name: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand — only shown inside mobile drawer (desktop brand is in the aside header area) */}
      <div className="hidden-in-desktop flex items-center gap-2.5 pb-5 shrink-0">
        {/* intentionally empty — brand shown in drawer header */}
      </div>

      {/* Scrollable nav groups */}
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} {...item} onClick={onNav} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="shrink-0 border-t border-gray-100 pt-3 mt-3 space-y-1">
        <div
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage 
            src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(name?name : "User")}`}
            />
            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
              JK
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">Store</p>
          </div>
        </div>
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

type StoreSidebarProps = {
  name: string;
}

const AdminSidebar = ({ name }: StoreSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-4 bottom-4 left-3 w-56 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm z-40 overflow-hidden">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
            {/* <Store className="w-4 h-4 text-white" /> */}
            <Logo />
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            Store Panel
          </span>
        </div>

        {/* Nav content — fills remaining height */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <SidebarContent name={name} />
        </div>
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
            <Logo />
          </div>
          <span className="text-sm font-bold text-gray-900">Store Panel</span>
        </div>
      </header>

      {/* ── Mobile Backdrop ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile Drawer ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer top bar */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              {/* <Store className="w-4 h-4 text-white" /> */}
              <Logo />
            </div>
            <span className="text-[15px] font-bold text-gray-900">
              Store Panel
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <SidebarContent name={name} onNav={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
