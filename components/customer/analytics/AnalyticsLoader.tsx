import { getWalletTopUpHistory } from "@/actions/common/getWalletRechargeHistory.action";
import { getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import AnalyticsDashboard from "@/components/customer/analytics/dashboard";
import {
  SerializedOrder,
  SerializedWalletPayment,
  WalletTopUpEntry,
} from "@/app/customer/(customer)/analytics/page";

export default async function AnalyticsLoader() {
  const [Orders, WalletHistory] = await Promise.all([
    getOrders(),
    getWalletTopUpHistory(),
  ]);

  const orders = (Orders ?? []) as SerializedOrder[];
  const stripeTopUps = (WalletHistory?.walletTopUpHistory?.stripeTopUps ?? []) as SerializedWalletPayment[];
  const walletTopUps = (WalletHistory?.walletTopUpHistory?.walletTopUps ?? []) as WalletTopUpEntry[];

  return (
    <AnalyticsDashboard
      orders={orders}
      stripeTopUps={stripeTopUps}
      walletTopUps={walletTopUps}
    />
  );
}