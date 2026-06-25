"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerateReferralCode } from "@/actions/customer/ProductAndStore/Cart.Action";

export function ReferralGenerate({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await GenerateReferralCode(customerId, customerName);
      if (res.success) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Icon bubble */}
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <Gift size={40} className="text-primary" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
            You don&apos;t have a referral code yet
          </h2>
          <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
            Generate your personal code and start earning{" "}
            <span className="font-medium text-foreground">CA$5</span> for every
            friend who joins and places their first order.
          </p>

          {/* CTA button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Gift size={16} />
                Create your referral code
              </>
            )}
          </Button>

          {/* Hint card */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-sm">
              💡
            </div>
            <p className="text-sm text-muted-foreground">
              Your code is unique to you and can be shared anywhere — WhatsApp,
              email, or in person.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}