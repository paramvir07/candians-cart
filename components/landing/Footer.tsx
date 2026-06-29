"use client";

import Logo from "../shared/Logo";
import { useRouter, usePathname } from "next/navigation";

const FOOTER_LINKS: Record<
  string,
  { label: string; href: string; scrollTo?: string; scrollPage?: string }[]
> = {
  Company: [
    { label: "How It Works", href: "/#how-it-works", scrollTo: "how-it-works", scrollPage: "/" },
    { label: "About Us", href: "/about" },
    { label: "Promotions", href: "/promotions" },
    { label: "Values", href: "/about#values", scrollTo: "values", scrollPage: "/about" },
    { label: "Careers", href: "/careers" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/#faq", scrollTo: "faq", scrollPage: "/" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  Tools: [
    { label: "Referrals", href: "/referrals" },
    { label: "Budget Packs", href: "/#grocery-packs", scrollTo: "grocery-packs", scrollPage: "/" },
    { label: "Calculator", href: "/#calculator", scrollTo: "calculator", scrollPage: "/" },
  ],
};

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/canadianscart",
    defaultColor: "text-pink-400",
    hoverBg: "hover:[background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)]",
    hoverBorder: "hover:border-transparent",
    hoverText: "hover:text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/canadianscart",
    defaultColor: "text-blue-400",
    hoverBg: "hover:bg-[#1877f2]",
    hoverBorder: "hover:border-transparent",
    hoverText: "hover:text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://vt.tiktok.com/ZSxjaYrjL/",
    defaultColor: "text-stone-300",
    hoverBg: "hover:bg-black",
    hoverBorder: "hover:border-transparent",
    hoverText: "hover:text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:info@canadianscart.ca",
    defaultColor: "text-red-400",
    hoverBg: "hover:bg-[#ea4335]",
    hoverBorder: "hover:border-transparent",
    hoverText: "hover:text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,4 12,13 22,4" />
      </svg>
    ),
  },
];

const NAVBAR_OFFSET = 80;

interface FooterProps {
  isLoggedIn?: boolean;
}

export default function Footer({ isLoggedIn = false }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string, scrollPage: string = "/") => {
    e.preventDefault();
    if (isLoggedIn && sectionId === "grocery-packs") {
      router.push("/customer/budget-packs");
      return;
    }
    if (pathname === scrollPage) {
      scrollToSection(sectionId);
    } else {
      router.push(`${scrollPage}?scrollTo=${sectionId}`);
    }
  };

  return (
    <footer className="bg-[#1c1917] text-[#e7e5e4] font-sans">
      {/* Main grid */}
      <div className="mx-auto max-w-[1200px] px-6 pt-14 pb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

        {/* Brand col */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo variant="icon" href="/" />
          <p className="mt-3 mb-5 text-[13px] leading-relaxed text-stone-400 max-w-[240px]">
            Subsidised grocery pickup for Canadian families in Abbotsford, BC.
            Save up to 30% on everyday essentials.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2 mt-5">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={[
                  "w-9 h-9 rounded-[9px] flex items-center justify-center",
                  "bg-white/[0.06] border border-white/[0.09]",
                  "transition-all duration-200 -translate-y-0",
                  "hover:-translate-y-0.5 hover:shadow-lg",
                  s.defaultColor,
                  s.hoverBg,
                  s.hoverBorder,
                  s.hoverText,
                ].join(" ")}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.8px] mb-3.5">
              {title}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {links.map((l) =>
                l.scrollTo ? (
                  <li key={l.label}>
                    <button
                      onClick={(e) => handleSectionClick(e, l.scrollTo!, l.scrollPage)}
                      className="text-[13px] font-medium text-stone-400 hover:text-green-400 transition-colors bg-transparent border-0 p-0 cursor-pointer font-sans"
                    >
                      {l.label}
                    </button>
                  </li>
                ) : (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] font-medium text-stone-400 hover:text-green-400 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] px-6 py-5">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between flex-wrap gap-4">
          <p className="text-[12px] text-stone-500">
            © {currentYear} Canadian's Cart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}