"use client";

import Logo from "@/components/shared/Logo";
import {
  BarChart,
  Banknote,
  HandCoins,
  HomeIcon,
  LinkIcon,
  Package,
  Receipt,
  ShoppingCart,
  UserPlus,
  Users2,
} from "lucide-react";
import Link from "next/link";

const FOOTER_GROUPS = [
  {
    label: "Management",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/customers", label: "Customers", icon: Users2 },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/store-payouts", label: "Payouts", icon: HandCoins },
      { href: "/admin/cash-collection", label: "Cash Collection", icon: Banknote },
      { href: "/admin/price-invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    label: "Other",
    items: [
      { href: "/admin/new-user", label: "New User", icon: UserPlus },
      { href: "/admin/referral-codes", label: "Referrals", icon: LinkIcon },
    ],
  },
];

function LogoPlaceholder() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Swap this div for your <Logo /> — use a light/white variant on dark bg */}
      <div className="w-9 h-9 rounded-xlflex items-center justify-center shrink-0">
        <Logo href="/admin" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-tight">Admin Panel</p>
        <p className="text-[11px] text-gray-500 leading-tight">Candian's Cart</p>
      </div>
    </div>
  );
}

const AdminFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-950 mt-10">
      {/* Top section */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">

          {/* Brand column */}
          <div className="md:w-56 shrink-0 space-y-4">
            <Logo href="/admin" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Internal admin portal for managing stores, orders, products, and
              platform finances.
            </p>
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-gray-400">All systems operational</span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px bg-gray-800 self-stretch" />

          {/* Nav columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-3">
                  {group.label}
                </p>
                <ul className="space-y-2.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group flex items-center gap-2.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-150"
                        >
                          <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-600">
            © {year} Candian's Cart. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-600">Made in Canada 🍁</p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;