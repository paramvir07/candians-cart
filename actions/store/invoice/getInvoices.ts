"use server";

import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import ProductInvoice from "@/db/models/store/invoice.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export async function getInvoices(storeId: string) {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    // Find invoices specifically matching the passed storeId
    const invoices = await ProductInvoice.find({
      storeId: new mongoose.Types.ObjectId(storeId),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Safely serialize for React Client Components
    const serializedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      _id: invoice._id?.toString(),
      storeId: invoice.storeId?.toString(),
      documentId: {
        url: invoice.documentId?.url,
        fileId: invoice.documentId?.fileId,
      },
      products: invoice.products?.map((product: any) => ({
        ...product,
        _id: product._id?.toString(),
        productId: product.productId?.toString(),
      })),

      DateInvoiceCame: invoice.DateInvoiceCame?.toISOString(),
      createdAt: invoice.createdAt?.toISOString(),
      updatedAt: invoice.updatedAt?.toISOString(),
    }));

    return { success: true, data: serializedInvoices };
  } catch (error) {
    console.error(`Error fetching the invoices:`, error);
    return { success: false, error: "Failed to fetch invoices" };
  }
}

export async function getTop5Invoices(storeId?: string) {
  try {
    const session = await getUserSession();

    await dbConnect();

    // Fallback: If no storeId is provided (e.g., Store Owner), use their session ID
    const targetStoreId = storeId || session.user.id;

    const invoices = await ProductInvoice.find({
      storeId: new mongoose.Types.ObjectId(targetStoreId),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .select("_id InvoiceNumber DateInvoiceCame");

    const serializedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      _id: invoice._id?.toString(),
      InvoiceNumber: invoice.InvoiceNumber,
      DateInvoiceCame: invoice.DateInvoiceCame?.toISOString(),
    }));

    return { success: true, data: serializedInvoices };
  } catch (error) {
    console.error(`Error fetching the invoices:`, error);
    return { success: false, error: "Failed to fetch invoices" };
  }
}
