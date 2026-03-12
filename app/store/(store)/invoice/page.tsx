import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { dbConnect } from "@/db/dbConnect";
import InvoicePageClient from "@/components/store/invoice/InvoicePageClient"; // Adjust path if needed

export default async function InvoicePage() {
  // 1. Get the authenticated user's session
  const session = await getUserSession();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-semibold">
        Unauthorized: Please log in.
      </div>
    );
  }

  // 2. Fetch the store ID from the database using the Auth ID
  await dbConnect();
  const store = await Store.findOne({ userId: sessionUserId })
    .select("_id")
    .lean();

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-semibold text-center px-4">
        Error: Store ID could not be determined. Please make sure you have an active store associated with your account.
      </div>
    );
  }

  const storeId = store._id.toString();

  // 3. Render the client component with the strictly typed string
  return <InvoicePageClient storeId={storeId} />;
}