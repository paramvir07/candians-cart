import InvoiceForm from "@/components/store/invoice/InvoiceForm";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { dbConnect } from "@/db/dbConnect";
import { redirect } from "next/navigation";

interface EditInvoicePageProps {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ storeId?: string }>;
}

export default async function EditInvoicePage({
  params,
  searchParams,
}: EditInvoicePageProps) {
  // 1. Await params and searchParams (Next.js 15 Best Practice)
  const { invoiceId } = await params;
  const { storeId: urlStoreId } = await searchParams;

  // Protect against missing IDs
  if (!invoiceId) {
    redirect("/store/invoice");
  }

  // 2. Get the authenticated user's session
  const session = await getUserSession();
  const sessionUserId = session?.user?.id;

  let finalStoreId = urlStoreId;

  // 3. If no storeId in URL, fetch it from the database using the Auth ID
  if (!finalStoreId && sessionUserId) {
    await dbConnect();

    // .select("_id") ensures we ONLY fetch the ID, saving memory and time
    // .lean() returns a plain JS object instead of a heavy Mongoose document
    const store = await Store.findOne({ userId: sessionUserId })
      .select("_id")
      .lean();

    if (store) {
      // Safely convert the MongoDB ObjectId to a standard string
      finalStoreId = store._id.toString();
    }
  }

  // 4. Handle cases where the store couldn't be determined
  if (!finalStoreId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-semibold text-center px-4">
        Error: Store ID could not be determined. Please make sure you have an active store associated with your account.
      </div>
    );
  }

  // 5. Render the form with the strictly typed strings
  // Passing invoiceId automatically triggers the isEditMode in InvoiceForm
  return <InvoiceForm storeId={finalStoreId} invoiceId={invoiceId} />;
}