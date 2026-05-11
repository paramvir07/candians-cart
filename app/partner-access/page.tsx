import Link from "next/link";
import { Shield, Store, UserCog, ChevronRight, ShoppingCart } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LoginCarousel } from "@/components/customer/login/LoginCarousel";
import Logo from "@/components/shared/Logo";

const PORTAL_OPTIONS = [
  {
    href: "/admin/login",
    icon: Shield,
    label: "Admin",
    description: "Oversee all operations and platform settings.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    href: "/store/login",
    icon: Store,
    label: "Store",
    description: "Manage inventory, orders and promotions.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    href: "/cashier/login",
    icon: UserCog,
    label: "Cashier",
    description: "Process customer orders and transactions.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
] as const;

// Shared selector content
function SelectorContent() {
  return (
    <>
      {/* Logo + heading */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          {/* <ShoppingCart className="text-primary-foreground" size={22} /> */}
          <Logo variant="icon" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Partner Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Select your role to continue.
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {PORTAL_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Link
              key={option.href}
              href={option.href}
              className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/60 bg-card hover:bg-secondary/60 hover:border-border transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${option.iconBg}`}>
                <Icon className={`h-[18px] w-[18px] ${option.iconColor}`} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
                  {option.label} Login
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {option.description}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Are you a customer?{" "}
          <Link href="/customer/login" className="text-primary hover:underline underline-offset-2">
            Login here
          </Link>
        </p>
      </div>
    </>
  );
}

export default async function PartnerAccessPortal() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/customer");

  return (
    <>
      {/* ── MOBILE: image top, card slides up ── */}
      <div className="flex flex-col w-full lg:hidden min-h-screen overflow-hidden">
        {/* Top image */}
        <div className="relative w-full h-[52vh] shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
            alt="Fresh groceries"
            sizes="(max-width: 1024px) 100vw, 340px"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Form card overlaps */}
        <div className="relative z-10 -mt-45 flex-1 bg-background rounded-t-3xl px-6 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <SelectorContent />
        </div>
      </div>

      {/* ── DESKTOP: same split as login page ── */}
      <div className="hidden lg:flex min-h-screen w-full items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="relative z-10 w-full max-w-5xl flex shadow-2xl rounded-2xl overflow-hidden">
          {/* Left — carousel */}
          <div className="w-[50%] shrink-0 p-2.5">
            <div className="h-full min-h-[575px]">
              <LoginCarousel />
            </div>
          </div>
          {/* Right — selector */}
          <div className="flex-1 flex items-center justify-center px-14 py-12 bg-card">
            <div className="w-full max-w-[380px]">
              <SelectorContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}