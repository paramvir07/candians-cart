import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/customer/landing/Navbar";
import { getUser } from "@/actions/customer/User.action";
import { getPendingReferralRequests } from "@/actions/customer/ReferralRequest.Action";
import { ReferralRequestsDashboard } from "@/components/customer/referral/ReferralDashboard";


// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RequestsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between mb-1">
        <div className="h-2.5 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-2.5 w-32 rounded-full bg-muted animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-28 rounded-full bg-muted animate-pulse" />
            <div className="h-2.5 w-20 rounded-full bg-muted/60 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Async content ────────────────────────────────────────────────────────────

async function RequestsContent() {
  const UserData = await getUser();
  if (!UserData) return null;

  const { data: requests } = await getPendingReferralRequests(
    UserData._id.toString()
  );

  return <ReferralRequestsDashboard requests={requests} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div
        className="relative mx-auto w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-12"
        style={{ maxWidth: "520px" }}
      >
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/customer/referrals"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft size={13} />
            Refer &amp; Earn
          </Link>

          <h1
            className="font-black leading-tight mb-2 text-foreground"
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: "clamp(26px, 7vw, 34px)",
              letterSpacing: "-0.03em",
            }}
          >
            Referral Requests
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: "380px" }}>
            People who want to use your referral code. Accept to earn when they place their first order.
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<RequestsSkeleton />}>
          <RequestsContent />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;