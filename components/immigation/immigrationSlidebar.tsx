"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, Package, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import Logo from "../shared/Logo";
import LogoutButton from "../shared/LogoutButton";
import { cn } from "@/lib/utils";

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

      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      )}
    </Link>
  );
}

// ─── Sidebar inner content ──────────────────────────────────────────────────────

function SidebarContent({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-1">
            General
          </p>

          <div className="space-y-0.5">
            <NavItem
              href="/immigration"
              label="Dashboard"
              icon={HomeIcon}
              exact
              onClick={onNav}
            />

            <NavItem
              href="/immigration/orders"
              label="Orders"
              icon={Package}
              onClick={onNav}
            />
          </div>
        </div>
      </nav>

      <div className="shrink-0 border-t border-gray-100 pt-3 mt-3 space-y-1">
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

const ImmigrationSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-4 bottom-4 left-3 w-56 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm z-40 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
            <Logo variant="icon" href="/"/>
          </div>

          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            Immigration
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
            <Logo variant="icon" href="/"/>
          </div>

          <span className="text-sm font-bold text-gray-900">Immigration</span>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-70 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <Logo variant="icon" href="/"/>
            </div>

            <span className="text-[15px] font-bold text-gray-900">
              Immigration
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
          <SidebarContent onNav={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
};

export default ImmigrationSidebar;
