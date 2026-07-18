// app/customer/(customer)/analytics/page.tsx

import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import AnalyticsLoader from "@canadian-cart/ui/customer/analytics/AnalyticsLoader";
import {
  SerializedProduct,
  SerializedOrder,
  SerializedWalletPayment,
  WalletTopUpEntry,
} from "@canadian-cart/types/customer/analytics";
import { Metadata } from "next";
import AnalyticsSkeleton from "@canadian-cart/ui/skeletons/CustomerAnalyticsSkeleton";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.9719 0.0055 158.5966)" }}
    >
      <Navbar />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsLoader />
      </Suspense>
    </div>
  );
}
