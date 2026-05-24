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
  Mail,
} from "lucide-react";
import Link from "next/link";

const FOOTER_GROUPS = [
  {
    label: "Management",
    items: [
      { href: "/store/orders", label: "Orders", icon: ShoppingCart },
      { href: "/store/products", label: "Products", icon: Package },
      { href: "/store/subsidy-list", label: "Subsidy List", icon: Users2 },
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
      { href: "/store/invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    label: "Other",
    items: [
      { href: "/store/", label: "Dashboard", icon: UserPlus },
      { href: "/store/analytics", label: "Analytics", icon: LinkIcon },
    ],
  },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/canadianscart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/canadianscart",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://vt.tiktok.com/ZSxjaYrjL/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
      </svg>
    ),
  },
    {
    label: "Email",
    href: "mailto:info@canadianscart.ca",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    ),
  },
];

function LogoPlaceholder() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xlflex items-center justify-center shrink-0">
        <Logo variant="icon" href="/store" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-tight">
          Store Panel
        </p>
        <p className="text-[11px] text-gray-500 leading-tight">
          Canadian's Cart
        </p>
      </div>
    </div>
  );
}

const StoreFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-950 mt-10">
      {/* Top section */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Brand column */}
          <div className="md:w-56 shrink-0 space-y-4">
            <Logo variant="icon" href="/store" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Internal store portal for managing orders and products.
            </p>
            <a
              href="mailto:info@canadianscart.ca"
              className="inline-flex items-center gap-2 text-[11px] text-gray-500 hover:text-emerald-400 transition-colors duration-150"
            >
              <Mail className="w-3 h-3 shrink-0" />
              info@canadianscart.ca
            </a>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-800 transition-colors duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-gray-400">
                All systems operational
              </span>
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
            © {year} Canadian's Cart. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-600">Made in Canada 🍁</p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;