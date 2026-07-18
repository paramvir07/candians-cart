import { getNotificationReadReceipts } from "@canadian-cart/actions/common/notification.action";
import { NotificationReceiptsView } from "@canadian-cart/ui/admin/notification/NotificationReceiptsView";
import { notFound } from "next/navigation";

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getNotificationReadReceipts(id);

  if (!result.success || !result.notification) notFound();

  return (
    <NotificationReceiptsView
      notification={result.notification!}
      receipts={result.receipts ?? []}
    />
  );
}