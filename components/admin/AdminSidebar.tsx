"use client";

import {
  Banknote,
  BarChart,
  BellIcon,
  HandCoins,
  Handshake,
  HomeIcon,
  LinkIcon,
  List,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import LogoutButton from "../shared/LogoutButton";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getPendingPriceChangesCount } from "@/actions/admin/invoice/getPriceChange";
import Logo from "../shared/Logo";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/customers", label: "Customers", icon: Handshake },
      { href: "/admin/requests", label: "Requests", icon: Users2 },

    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/store-payouts", label: "Payouts", icon: HandCoins },
      {
        href: "/admin/cash-collection",
        label: "Cash Collection",
        icon: Banknote,
      },
      { href: "/admin/price-invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    label: "Other",
    items: [
      { href: "/admin/new-user", label: "New User", icon: UserPlus },
      { href: "/admin/referral-codes", label: "Referrals", icon: LinkIcon },
      { href: "/admin/subsidy-list", label: "Subsidy List", icon: List },
      { href: "/admin/notifications", label: "Notifications", icon: BellIcon },
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
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
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

      {badge !== undefined && badge > 0 ? (
        <div className="ml-auto flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shrink-0">
          {badge}
        </div>
      ) : active ? (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      ) : null}
    </Link>
  );
}

function SidebarContent({
  onNav,
  pendingInvoicesCount,
  name,
}: {
  onNav?: () => void;
  pendingInvoicesCount: number;
  name: string
}) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  badge={
                    item.label === "Invoices" ? pendingInvoicesCount : undefined
                  }
                  onClick={onNav}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-100 pt-3 mt-3 space-y-1">
        <div
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full cursor-pointer"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage 
              src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(name?name : "User")}`}
 
            />
            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">Admin</p>
          </div>
        </div>
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

type AdminSidebarProps = {
  name: string;
};


const AdminSidebar = ({ name }: AdminSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    const fetchPendingCount = async () => {
      const count = await getPendingPriceChangesCount();
      setPendingInvoicesCount(count);
    };
    fetchPendingCount();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      {/*
        KEY CHANGE: was `fixed top-4 bottom-4 left-3` — now `sticky top-4`.
        `sticky` behaves like fixed (floats while you scroll) but is scoped to
        its containing block. Since the layout puts <AdminFooter> OUTSIDE the
        flex row that contains this sidebar, sticky naturally stops at the
        footer edge. `self-start` keeps the aside at its own height so sticky
        actually works. `max-h-[calc(100vh-2rem)]` caps the height so it
        never taller than the viewport.
      */}
      <aside className="hidden md:flex sticky top-4 self-start flex-col bg-white rounded-2xl border border-gray-100 shadow-sm z-40 overflow-hidden w-56 ml-3 h-[calc(100vh-2rem)]">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
            <Logo variant="icon" href="/admin" />
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            Admin Panel
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <SidebarContent pendingInvoicesCount={pendingInvoicesCount} name={name} />
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
            <Logo variant="icon" href="/admin" />
          </div>
          <span className="text-sm font-bold text-gray-900">Admin Panel</span>
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
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <Logo variant="icon" href="/admin" />
            </div>
            <span className="text-[15px] font-bold text-gray-900">
              Admin Panel
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

        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <SidebarContent
            onNav={() => setMobileOpen(false)}
            pendingInvoicesCount={pendingInvoicesCount}
            name={name}
          />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;