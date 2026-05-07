import Link from "next/link";
import Logo from "@/components/shared/Logo";

const LINKS = {
  Shop: [
    { label: "All Products", href: "/customer" },
    { label: "Fresh Produce", href: "/customer?category=Produce" },
    { label: "Dairy & Eggs", href: "/customer?category=Dairy" },
    { label: "Bakery", href: "/customer?category=Bakery" },
  ],
  Account: [
    { label: "My Profile", href: "/customer/profile" },
    { label: "Budget Packs", href: "/customer/budget-packs" },
    { label: "My Wallet", href: "/customer/wallet" },
    { label: "Order History", href: "/customer/orders" },
    { label: "Edit Profile", href: "/customer/profile/edit" },
    { label: "Change Password", href: "/customer/change-password" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

// ── Easy swap zone ──────────────────────────────────────────────
const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/candianscart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  // {
  //   label: "Facebook",
  //   href: "https://facebook.com/candianscart",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  //       <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  //     </svg>
  //   ),
  // },
  // {
  //   label: "X / Twitter",
  //   href: "https://x.com/candianscart",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  //       <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  //     </svg>
  //   ),
  // },
  // {
  //   label: "TikTok",
  //   href: "https://tiktok.com/@candianscart",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  //       <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
  //     </svg>
  //   ),
  // },
];
// ───────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-muted/30 pt-6 pb-0 overflow-hidden">

      <div className="px-4 sm:px-6 overflow-hidden">
        {/* ── Card ── */}
        <div className="max-w-7xl mx-auto rounded-3xl border border-border/60 bg-card px-6 sm:px-10 pt-10 pb-8">

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">

            {/* Left — brand + socials */}
            <div className="md:max-w-[220px] shrink-0 flex flex-col gap-5">
              <div>
                <Logo variant="full" />
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  The exclusive family grocery platform for fresh produce and pantry
                  essentials for Canadian families.
                </p>
              </div>

              {/* Socials */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">Follow us</p>
                <div className="flex items-center gap-2">
                  {SOCIALS.map(({ label, href, icon }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      {icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — link columns */}
            <div className="grid grid-cols-3 gap-8 flex-1">
              {Object.entries(LINKS).map(([group, links]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-foreground mb-3">{group}</p>
                  <ul className="space-y-2.5">
                    {links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-border/60 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}Candian&apos;s Cart. All rights reserved.
            </p>
            {/* <div className="flex items-center gap-4">
              {["Privacy Policy", "Terms of Service"].map((t) => (
                <Link
                  key={t}
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {t}
                </Link>
              ))}
            </div> */}
          </div>
        </div>
      </div>

      {/* ── Watermark ── */}
      <div
        aria-hidden
        className="pointer-events-none select-none flex justify-center overflow-hidden h-24 md:h-44 lg:h-62 -mt-2"
      >
        <span className="text-[8rem] md:text-[15rem] lg:text-[22rem] font-black text-foreground/10 whitespace-nowrap leading-none tracking-tighter">
          Candian's
        </span>
      </div>

    </footer>
  );
}