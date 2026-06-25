import Navbar from "@/components/customer/landing/Navbar";
import { ShoppingCart } from "lucide-react";

export function NotEligibleState() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Icon bubble */}
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart size={40} className="text-primary" />
              {/* small lock badge */}
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border text-base">
                🔒
              </span>
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
            Referrals unlock after your first order
          </h2>
          <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
            Place an order over{" "}
            <span className="font-medium text-foreground">CA$21</span> to get
            your personal referral code and start earning CA$5 for every friend
            who joins.
          </p>

          {/* Steps */}
          <div className="rounded-2xl border border-border bg-card px-5 py-4 space-y-3">
            {[
              { step: "1", label: "Place your first order over CA$21" },
              { step: "2", label: "Your referral code gets activated" },
              { step: "3", label: "Share it and earn CA$5 per friend" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step}
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
