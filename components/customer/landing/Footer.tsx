import Link from "next/link";
import Logo from "@/components/shared/Logo";

const LINKS = {
  Shop: [
    { label: "All Products", href: "/customer/search" },
    { label: "Fresh Produce", href: "/customer/search" },
    { label: "Dairy & Eggs", href: "/customer/search" },
    { label: "Bakery", href: "/customer/search" },
  ],
  Account: [
    { label: "My Profile", href: "/customer/profile" },
    { label: "Order History", href: "/customer/orders" },
    { label: "My Wallet", href: "/customer/wallet" },
    { label: "Edit Profile", href: "/customer/profile/edit" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/30 pt-6 pb-0 overflow-hidden">

        <div className="px-4 sm:px-6 overflow-hidden">
      {/* ── Card ── */}
      <div className="max-w-7xl mx-auto rounded-3xl border border-border/60 bg-card px-6 sm:px-10 pt-10 pb-8">

        <div className="flex flex-col md:flex-row gap-10 md:gap-16">

          {/* Left — brand */}
          <div className="md:max-w-[220px] shrink-0">
            <Logo />
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              The exclusive family grocery platform fresh produce and pantry
              essentials for Canadian families.
            </p>
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
            © {new Date().getFullYear()} Candian&apos;s Cart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service"].map((t) => (
              <Link
                key={t}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
        </div>


      {/* ── Watermark — top half peeks below card ── */}
      <div
        aria-hidden
        className="pointer-events-none select-none flex justify-center overflow-hidden h-24 md:h-44 lg:h-62 -mt-2"
      >
        <span className="text-[8rem] md:text-[15rem] lg:text-[22rem] font-black text-foreground/10 whitespace-nowrap leading-none tracking-tighter">
          Candian
        </span>
      </div>

    </footer>
  );
}