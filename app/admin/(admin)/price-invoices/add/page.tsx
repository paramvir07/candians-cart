import InvoiceForm from "@/components/store/invoice/InvoiceForm";
import { getStores } from "@/actions/store/getStores.actions";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { redirect } from "next/navigation";

export default async function AdminAddInvoicePage() {
  const session = await getUserSession();
  
  // Ensure strict role gatekeeping for the admin panel
  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }

  // Fetch all stores exclusively for Admin access
  const storesResponse = await getStores();
  const stores = storesResponse.success ? storesResponse.data : [];

  return (
    <InvoiceForm 
       isAdmin={true} 
       stores={stores} 
    />
  );
}