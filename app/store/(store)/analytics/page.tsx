import { getStoreAnalytics } from "@/actions/store/getStoreAnalytics.action";
import StoreAnalyticsClient from "@/components/store/StoreAnalyticsClient";

export default async function StoreAnalyticsPage() {
  const data = await getStoreAnalytics();
  return <StoreAnalyticsClient data={data} />;
}
