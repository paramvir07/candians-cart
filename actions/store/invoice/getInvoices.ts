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