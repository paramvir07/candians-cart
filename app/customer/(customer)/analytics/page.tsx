import { getWalletTopUpHistory } from "@/actions/common/getWalletRechargeHistory.action";
import { getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import AnalyticsDashboard from "@/components/customer/analytics/dashboard";
import Navbar from "@/components/customer/landing/Navbar";
import { PlaceOrderProduct } from "@/db/models/customer/Orders.Model";
import { IWalletPayment } from "@/db/models/customer/WalletPayment.model";
import { PlaceOrderI } from "@/db/models/customer/Orders.Model";
import { Metadata } from "next";

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

export type SerializedOrder = Omit<PlaceOrderI, "products" | "subsidyItems" | "userId" | "storeId" | "cashierId"> & {
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

const AnalyticsPage = async () => {
  const [Orders, WalletHistory] = await Promise.all([
    getOrders(),
    getWalletTopUpHistory(),
  ]);

  const orders = (Orders ?? []) as SerializedOrder[];
  const stripeTopUps = (WalletHistory?.walletTopUpHistory?.stripeTopUps ?? []) as SerializedWalletPayment[];
  const walletTopUps = (WalletHistory?.walletTopUpHistory?.walletTopUps ?? []) as WalletTopUpEntry[];


  return (
    <div className="min-h-screen" style={{ background: "oklch(0.9719 0.0055 158.5966)" }}>
      <Navbar />
      <AnalyticsDashboard
        orders={orders}
        stripeTopUps={stripeTopUps}
        walletTopUps={walletTopUps}
      />
    </div>
  );
};

export default AnalyticsPage;