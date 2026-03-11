"use server";

import { dbConnect } from "@/db/dbConnect";
import ProductInvoice from "@/db/models/store/invoice.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export async function getInvoices(searchQuery: string = "") {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const invoices = await ProductInvoice.find().sort({createdAt: -1}).limit(50).lean();

    const serializedInvoices = JSON.parse(JSON.stringify(invoices))

    return{success: true, data: serializedInvoices}
  } catch (error) {
    console.log(`Error fetching the invoices: ${error}`);
    return{success: false, error: "Failed to fetch invoices"}
  }
}
