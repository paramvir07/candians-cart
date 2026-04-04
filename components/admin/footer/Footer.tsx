import Link from "next/link";
import { Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/shared/Logo";

const NAV_SECTIONS = [
  {
    heading: "Company",
    links: [
      { label: "About Us",    href: "/about"       },
      { label: "How It Works",href: "/how-it-works"},
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us",  href: "/contact"     },
      { label: "Help",        href: "/help"        },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#1c1c1a] text-white">
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-2">
            {/* Replace with <Logo /> */}
            <Logo />

            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
              Subsidised grocery pickup for Canadian families in Abbotsford,
              BC. Save up to 30% on everyday essentials.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2 mt-1">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-md border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors duration-150"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </Link>
            </div>
          </div>

          {/* Nav columns */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {section.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/8" />

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Candian's Cart Inc. All rights reserved.
          </p>

          {/* Made in Canada badge */}
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="text-sm">🍁</span>
            <span>Made in Canada</span>
          </div>
        </div>
      </div>
    </footer>
  );
}