import InvoiceForm from "@canadian-cart/ui/store/invoice/InvoiceForm";
import { getStores } from "@canadian-cart/actions/store/getStores";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession";
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