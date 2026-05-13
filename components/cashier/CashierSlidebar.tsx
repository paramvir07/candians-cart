"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Package,
  ReceiptText,
  ShoppingBag,
  ShoppingCartIcon,
  Wallet,
  Menu,
  X,
  UserCircle2,
  List,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LogoutButton from "../shared/LogoutButton";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Logo from "../shared/Logo";
// ─── Types ──────────────────────────────────────────────────────────────────────

type CustomerData = {
  customerData?: {
    id?: string;
    name?: string;
    cartCount?: number;
    walletBalance?: number;
  };
};

// ─── Active check ───────────────────────────────────────────────────────────────

function useIsActive(href: string, exact = false) {
  const pathname = usePathname();
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── NavItem ────────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
  onClick?: () => void;
}) {
  const active = useIsActive(href, exact);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full relative",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
      )}
    >
      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0",
          active
            ? "text-emerald-600"
            : "text-gray-400 group-hover:text-gray-600",
        )}
      />
      <span
        className={cn(
          "text-sm font-medium flex-1",
          active ? "text-emerald-700" : "text-gray-600",
        )}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto shrink-0 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && !badge && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      )}
    </Link>
  );
}

// ─── Sidebar inner content ──────────────────────────────────────────────────────

function SidebarContent({
  customerData,
  onNav,
}: {
  customerData?: CustomerData["customerData"];
  onNav?: () => void;
}) {
  const customerId = customerData?.id;

  return (
    <div className="flex flex-col h-full">
      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">
        {/* General */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-1">
            General
          </p>
          <div className="space-y-0.5">
            <NavItem
              href="/cashier"
              label="Dashboard"
              icon={HomeIcon}
              exact
              onClick={onNav}
            />
            <NavItem
              href="/cashier/subsidy-list"
              label="Subsidy List"
              icon={List}
              onClick={onNav}
            />
          </div>
        </div>

        {/* Customer section — only when a customer is selected */}
        {customerId && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-1">
              Current Customer
            </p>

            {/* Customer identity chip */}
            <Link
              href={`/cashier/customer/${customerId}`}
              onClick={onNav}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors mb-1"
            >
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-emerald-200">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customerData?.name ?? "User")}`}
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-xs">
                  {(customerData?.name ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {customerData?.name ?? "Customer"}
                </p>
                <p className="text-xs text-gray-400">View profile</p>
              </div>
            </Link>

            <div className="space-y-0.5">
              <NavItem
                href={`/cashier/customer/${customerId}/cart`}
                label="Cart"
                icon={ShoppingCartIcon}
                badge={customerData?.cartCount}
                onClick={onNav}
              />
              <NavItem
                href={`/cashier/customer/${customerId}/orders`}
                label="Orders"
                icon={Package}
                onClick={onNav}
              />
              <NavItem
                href={`/cashier/customer/${customerId}/products`}
                label="Products"
                icon={ShoppingBag}
                onClick={onNav}
              />
              <NavItem
                href={`/cashier/customer/${customerId}/wallet`}
                label="Wallet"
                icon={Wallet}
                onClick={onNav}
              />
            </div>
          </div>
        )}

        {/* Placeholder when no customer selected */}
        {!customerId && (
          <div className="mx-1 px-4 py-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
            <UserCircle2 className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
            <p className="text-xs text-gray-400 font-medium">
              No customer selected
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Select a customer to see their actions
            </p>
          </div>
        )}
      </nav>

      {/* Profile + Logout */}
      <div className="shrink-0 border-t border-gray-100 pt-3 mt-3 space-y-1">
        <Link
          href="/cashier/profile"
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
              CS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              Profile
            </p>
            <p className="text-xs text-gray-400 leading-tight">Cashier</p>
          </div>
        </Link>
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

const CashierSidebar = ({ customerData }: CustomerData) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-4 bottom-4 left-3 w-56 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm z-40 overflow-hidden">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
            <Logo variant="icon" />
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            Cashier
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <SidebarContent customerData={customerData} />
        </div>
      </aside>

      {/* ── Mobile top bar ─────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
            <Logo variant="icon" />
          </div>
          <span className="text-sm font-bold text-gray-900">Cashier</span>
        </div>

        {/* Show customer name on mobile if selected */}
        {customerData?.id && (
          <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 truncate max-w-[140px]">
            {customerData.name ?? "Customer"}
          </span>
        )}
      </header>

      {/* ── Mobile backdrop ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-[55] w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              {/* <ShoppingCartIcon className="w-4 h-4 text-white" /> */}
              <Logo variant="icon" />
            </div>
            <span className="text-[15px] font-bold text-gray-900">Cashier</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <SidebarContent
            customerData={customerData}
            onNav={() => setMobileOpen(false)}
          />
        </div>
      </div>
    </>
  );
};

export default CashierSidebar;
