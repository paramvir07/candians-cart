import { getStoreAnalytics } from "@canadian-cart/actions/store/getStoreAnalytics.action";
import StoreAnalyticsClient from "@canadian-cart/ui/store/StoreAnalyticsClient";

export default async function StoreAnalyticsPage() {
  const data = await getStoreAnalytics();
  return <StoreAnalyticsClient data={data} />;
}
