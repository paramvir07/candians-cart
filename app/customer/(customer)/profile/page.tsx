import { getCustomerAndStoreDataAction } from "@/actions/customer/User.action";
import Navbar from "@/components/customer/landing/Navbar";
import ProfileHero from "@/components/customer/profile/ProfileHero";
import ProfileStats from "@/components/customer/profile/ProfileStats";
import ProfileStore from "@/components/customer/profile/ProfileStore";
import ProfileContact from "@/components/customer/profile/ProfileContact";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoutButton from "@/components/customer/profile/LogoutButton";

export default async function ProfilePage() {
  const { customerData } = await getCustomerAndStoreDataAction();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Desktop top bar ── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
              >
                <MoveLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-base lg:text-lg font-bold tracking-tight leading-none">
                My Profile
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/*
          Mobile / Tablet  → single column, max-w-lg centered
          Desktop (lg+)    → two columns: left = hero + stats, right = contact + store
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5 lg:gap-8 lg:items-start max-w-lg mx-auto lg:max-w-none">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            <ProfileHero customer={customerData} />
            <ProfileStats customer={customerData} />

            {/* Desktop-only quick links card */}
            <div className="hidden lg:block rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Quick Actions
                </p>
              </div>
              <div className="divide-y divide-border/40">
                {[
                  {
                    label: "Edit Profile",
                    href: "/customer/profile/edit",
                    emoji: "✏️",
                    desc: "Update your personal info",
                  },
                  {
                    label: "Order History",
                    href: "/customer/orders",
                    emoji: "📦",
                    desc: "View your past orders",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-muted-foreground/30 group-hover:text-primary/60 transition-colors text-lg">
                      ›
                    </span>
                  </Link>
                ))}
                {/* Logout — desktop row */}
                <div className="border-t border-rose-200/40 dark:border-rose-900/30">
                  <LogoutButton variant="row" />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            <ProfileContact customer={customerData} />
            <ProfileStore store={customerData.associatedStoreId} />
            {/* Logout — mobile/tablet (hidden on lg where it lives in Quick Actions) */}
            <div className="lg:hidden">
              <LogoutButton variant="card" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
