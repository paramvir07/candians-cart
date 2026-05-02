import { getCustomerAndStoreDataAction } from "@/actions/customer/User.action";
import Navbar from "@/components/customer/landing/Navbar";
import ProfileHero from "@/components/customer/profile/ProfileHero";
import ProfileStats from "@/components/customer/profile/ProfileStats";
import ProfileStore from "@/components/customer/profile/ProfileStore";
import ProfileContact from "@/components/customer/profile/ProfileContact";
import LogoutButton from "@/components/customer/profile/LogoutButton";
import {
  Edit,
  Package,
  Wallet,
  ChevronRight,
  ChevronLeft,
  ChartSpline,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { getOrderCount } from "@/actions/customer/ProductAndStore/Order.Action";
import { Metadata } from "next";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";

export const metadata: Metadata = {
  title: "Profile", // This becomes "Orders | Store Panel - Candian's Cart" in the browser tab
};

export default async function ProfilePage() {
  const [customerRes, orderRes] = await Promise.all([
    getCustomerAndStoreDataAction(),
    getOrderCount(),
  ]);

  const { customerData } = customerRes;
  const { orderCount } = orderRes;

  const quickLinks = [
    {
      label: "Edit Profile",
      desc: "Update your personal info",
      href: "/customer/profile/edit",
      icon: Edit,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Change Password",
      desc: "Change your password",
      href: "/customer/change-password",
      icon: KeyRound,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Order History",
      desc: "View past orders",
      href: "/customer/orders",
      icon: Package,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: "My Wallet",
      desc: "Balance & transactions",
      href: "/customer/wallet",
      icon: Wallet,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      label: "Analytics",
      desc: "View analytics",
      href: "/customer/analytics",
      icon: ChartSpline,
      iconBg: "bg-blue-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  const QuickActions = () => (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Quick Actions
        </p>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-1">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary/60 transition-colors"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
            >
              <item.icon
                className={`h-4 w-4 ${item.iconColor}`}
                strokeWidth={1.75}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
                {item.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.desc}
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BlurFade delay={0.05} inView>
          <div className="flex items-center gap-3 py-4 lg:py-6">
            <Link href="/customer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                My Profile
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </BlurFade>

        <div className="pb-20 max-w-lg mx-auto lg:max-w-none">
          {/* ── Mobile ── */}
          <div className="flex flex-col gap-4 lg:hidden">
            <BlurFade delay={0.1} inView>
              <ProfileHero customer={customerData} />
              <CustomerAdvertisements />
            </BlurFade>
            <BlurFade delay={0.18} inView>
              <ProfileStats
                customer={customerData}
                OrderCount={orderCount ?? 0}
              />
            </BlurFade>
            <BlurFade delay={0.26} inView>
              <ProfileContact customer={customerData} />
            </BlurFade>
            <BlurFade delay={0.34} inView>
              <ProfileStore store={customerData.associatedStoreId} />
            </BlurFade>
            <BlurFade delay={0.42} inView>
              <QuickActions />
            </BlurFade>
            <BlurFade delay={0.5} inView>
              <LogoutButton variant="card" />
            </BlurFade>
          </div>

          {/* ── Desktop ── */}
          <div className="hidden lg:grid grid-cols-[1fr_340px] gap-6 items-start">
            {/* Left col */}
            <div className="flex flex-col gap-4">
              <BlurFade delay={0.1} inView>
                <ProfileHero customer={customerData} />
              </BlurFade>
              <CustomerAdvertisements />
              <BlurFade delay={0.22} inView>
                <ProfileStore store={customerData.associatedStoreId} />
              </BlurFade>
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-4">
              <BlurFade delay={0.16} inView>
                <ProfileStats
                  customer={customerData}
                  OrderCount={orderCount ?? 0}
                />
              </BlurFade>
              <BlurFade delay={0.28} inView>
                <ProfileContact customer={customerData} />
              </BlurFade>
              <BlurFade delay={0.36} inView>
                <QuickActions />
              </BlurFade>
              <BlurFade delay={0.44} inView>
                <LogoutButton variant="card" />
              </BlurFade>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
