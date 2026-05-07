import InvoiceForm from "@/components/store/invoice/InvoiceForm";
import { redirect } from "next/navigation";

interface AdminEditInvoicePageProps {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminEditInvoicePage({
  params,
  searchParams,
}: AdminEditInvoicePageProps) {
  // 1. Await the dynamic route and query params
  const { invoiceId } = await params;
  const { storeId } = await searchParams;

  // 2. Protect against missing IDs (if someone manually tampers with the URL)
  if (!invoiceId || !storeId) {
    redirect("/admin/price-invoices");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Admin Invoice Editor</h1>
        <p className="text-muted-foreground text-sm">
          Modifying invoice records across the system.
        </p>
      </div>

      {/* 3. Reuse your exact Store form component */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <InvoiceForm storeId={storeId} invoiceId={invoiceId} />
      </div>
    </div>
  );
}