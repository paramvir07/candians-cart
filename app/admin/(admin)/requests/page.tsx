import { Suspense } from "react";
import { getAllRequests } from "@/actions/admin/Requests/request";
import RequestsPanel from "@/components/requests/requestPanel";
import { RequestSkeleton } from "@/components/requests/requestSkeleton";


async function RequestsContent() {
  const { help, contact } = await getAllRequests();
  return <RequestsPanel initialHelp={help} initialContact={contact} />;
}

const Page = () => {
  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage inquiries submitted through contact and help forms by
          users and businesses.
        </p>
      </div>

      <Suspense fallback={<RequestSkeleton />}>
        <RequestsContent />
      </Suspense>
    </div>
  );
};

export default Page;