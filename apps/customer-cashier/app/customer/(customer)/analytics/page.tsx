// app/customer/(customer)/analytics/page.tsx

import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import AnalyticsLoader from "@canadian-cart/ui/customer/analytics/AnalyticsLoader";
import { PlaceOrderProduct } from "@canadian-cart/db/models/customer/Orders.Model";
import { IWalletPayment } from "@canadian-cart/db/models/customer/WalletPayment.model";
import { PlaceOrderI } from "@canadian-cart/db/models/customer/Orders.Model";
import { Metadata } from "next";
import AnalyticsSkeleton from "@canadian-cart/ui/skeletons/CustomerAnalyticsSkeleton";

export const metadata: Metadata = {
  title: "Analytics",
};

export type SerializedProduct = Omit<PlaceOrderProduct, "productId"> & {
  productId: {
    _id: string;
    name: string;
    category: string;
    images?: { url: string }[];
  };
};

export type SerializedOrder = Omit<
  PlaceOrderI,
  "products" | "subsidyItems" | "userId" | "storeId" | "cashierId"
> & {
  _id: string;
  products: SerializedProduct[];
  subsidyItems: SerializedProduct[];
  userId: string;
  storeId: string;
  cashierId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializedWalletPayment = Omit<IWalletPayment, "userId"> & {
  _id: string;
  userId: string;
  createdAt: string;
};

export type WalletTopUpEntry = {
  _id: string;
  customerId: string;
  value: number;
  createdAt: string;
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