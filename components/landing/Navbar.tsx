"use client";

import { useEffect, useState, useRef } from "react";
import Logo from "../shared/Logo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Menu, X, Home, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth/login-logout.actions";

type TNavLink =
  | { label: string; href: string; scrollTo?: string; children?: never }
  | {
      label: string;
      href?: never;
      scrollTo?: never;
      children: { label: string; href: string }[];
    };

const NAV_LINKS: TNavLink[] = [
  {
    label: "How It Works",
    href: "/#how-it-works",
    scrollTo: "how-it-works",
  },
  {
    label: "Promotions",
    href: "/promotions",
  },
  {
    label: "Calculator",
    href: "/#calculator",
    scrollTo: "calculator",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Careers",
    href: "/careers",
  },
  {
    label: "Referrals",
    href: "/referrals",
  },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  role?: "customer" | "store" | "admin" | "cashier";
}

const ROLE_HOME: Record<string, string> = {
  customer: "/customer",
  store: "/store",
  admin: "/admin",
  cashier: "/cashier",
};

export default function Navbar({
  isLoggedIn = false,
  role = "customer",
}: NavbarProps) {
  const homeHref = ROLE_HOME[role] ?? "/customer";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const response = await logoutAction();
    if (response.success) {
      closeMobile();
      router.push("/");
    }
    setLoggingOut(false);
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    closeMobile();

    if (isLoggedIn && sectionId === "grocery-packs") {
      router.push("/customer/budget-packs");
      return;
    }

    if (pathname === "/") {
      const navbarHeight = 72;
      const el = document.getElementById(sectionId);
      if (el) {
        const top =
          el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      router.push(`/?scrollTo=${sectionId}`);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <nav
        ref={menuRef}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-[#fef5e4]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(68,25,6,0.08),0_4px_24px_rgba(68,25,6,0.07)]"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-0 px-4 sm:px-6">
          {/* ── Hamburger (mobile only) ── */}
          <button
            className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-black/5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-stone-700" />
            ) : (
              <Menu className="h-5 w-5 text-stone-700" />
            )}
          </button>

          {/* ── Logo ── */}
          <div className="mr-4">
            <Logo variant="icon" href="/" />
          </div>

          {/* ── Desktop nav links ── */}
          <div className="hidden flex-1 items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="group relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold text-stone-600 transition-colors hover:bg-green-700/8 hover:text-green-800"
                  >
                    {link.label}
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  <div className="absolute left-0 top-full h-2.5 w-full" />

                  <div className="pointer-events-none absolute left-0 top-[calc(100%+10px)] z-50 min-w-[200px] translate-y-[-6px] rounded-2xl border border-stone-900/10 bg-white p-1.5 opacity-0 shadow-xl shadow-stone-900/10 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    {link.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-[13px] font-medium text-stone-600 transition-colors hover:bg-green-50 hover:text-green-800"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : link.scrollTo ? (
                <button
                  key={link.label}
                  onClick={(e) => handleSectionClick(e, link.scrollTo!)}
                  className="rounded-lg px-3 py-1.5 text-[13.5px] font-semibold text-stone-600 transition-colors hover:bg-green-700/8 hover:text-green-800"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href!}
                  className="rounded-lg px-3 py-1.5 text-[13.5px] font-semibold text-stone-600 transition-colors hover:bg-green-700/8 hover:text-green-800"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          {/* ── Right side ── */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* Location pill */}
            <div className="hidden items-center gap-1.5 rounded-full bg-stone-900/5 px-3 py-1.5 sm:flex">
              <MapPin className="h-3 w-3 shrink-0 text-stone-500" />
              <span className="text-[11.5px] font-semibold text-stone-500 whitespace-nowrap">
                Abbotsford, BC
              </span>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Home button */}
                <Link href={homeHref}>
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 rounded-xl bg-gradient-to-b from-green-400 to-green-600 px-4 text-[13.5px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_3px_10px_rgba(22,101,52,.25)] transition-all hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,.1),0_6px_18px_rgba(22,101,52,.35)] border-0"
                  >
                    <Home className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>

                {/* Desktop logout button — hidden on mobile (use sidebar instead) */}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="hidden lg:flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Log out"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>{loggingOut ? "Logging out…" : "Log Out"}</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/customer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden h-9 rounded-xl border-stone-900/15 px-4 text-[13.5px] font-bold text-stone-600 hover:border-green-700/25 hover:bg-green-700/7 hover:text-green-800 sm:flex"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/customer/signup">
                  <Button
                    size="sm"
                    className="h-9 rounded-xl bg-gradient-to-b from-green-400 to-green-600 px-4 text-[13.5px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_3px_10px_rgba(22,101,52,.25)] transition-all hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,.1),0_6px_18px_rgba(22,101,52,.35)] border-0"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MOBILE DRAWER
        ══════════════════════════════════════════ */}
        <div
          className={cn(
            "fixed inset-x-0 top-16 z-40 overflow-y-auto bg-white shadow-2xl shadow-stone-900/15 transition-all duration-300 ease-in-out lg:hidden",
            "max-h-[calc(100dvh-64px)] border-t border-stone-900/8",
            mobileOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-3 opacity-0 pointer-events-none",
          )}
        >
          <div className="px-4 pb-8 pt-2">
            {/* Location */}
            <div className="flex items-center gap-2 px-2 py-3 border-b border-stone-100 mb-1">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              <span className="text-[12px] font-semibold text-stone-400">
                Abbotsford, BC
              </span>
            </div>

            {/* Nav links */}
            <div className="py-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      className="flex w-full items-center justify-between px-2 py-3.5 text-[14px] font-semibold text-stone-800 border-b border-stone-100 last:border-0 transition-colors hover:text-green-800"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === link.label ? null : link.label,
                        )
                      }
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-stone-400 transition-transform duration-200",
                          openDropdown === link.label && "rotate-180",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        openDropdown === link.label ? "max-h-96" : "max-h-0",
                      )}
                    >
                      <div className="mx-1 mb-2 mt-0.5 rounded-xl bg-stone-50">
                        {link.children.map((c) => (
                          <Link
                            key={c.label}
                            href={c.href}
                            onClick={closeMobile}
                            className="flex items-center gap-2.5 px-4 py-3 text-[13.5px] font-medium text-stone-600 transition-colors hover:text-green-800 border-b border-stone-100/80 last:border-0 hover:bg-green-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : link.scrollTo ? (
                  <button
                    key={link.label}
                    onClick={(e) => handleSectionClick(e, link.scrollTo!)}
                    className="flex w-full items-center justify-between px-2 py-3.5 text-[14px] font-semibold text-stone-800 border-b border-stone-100 last:border-0 transition-colors hover:text-green-800"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href!}
                    onClick={closeMobile}
                    className="flex items-center justify-between px-2 py-3.5 text-[14px] font-semibold text-stone-800 border-b border-stone-100 last:border-0 transition-colors hover:text-green-800"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            {/* CTA buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {isLoggedIn ? (
                <>
                  <Link href={homeHref} onClick={closeMobile}>
                    <Button className="h-12 w-full gap-2 rounded-xl bg-gradient-to-b from-green-400 to-green-600 text-[14px] font-bold text-white shadow-[0_3px_10px_rgba(22,101,52,.3)] border-0">
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="h-12 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-[14px] font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    {loggingOut ? "Logging out…" : "Log Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/customer" onClick={closeMobile}>
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-xl border-stone-900/12 text-[14px] font-bold text-stone-700"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/customer/signup" onClick={closeMobile}>
                    <Button className="h-12 w-full rounded-xl bg-gradient-to-b from-green-400 to-green-600 text-[14px] font-bold text-white shadow-[0_3px_10px_rgba(22,101,52,.3)] border-0">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}