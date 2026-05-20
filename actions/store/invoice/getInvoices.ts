"use server";

import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import ProductInvoice from "@/db/models/store/invoice.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import Product from "@/db/models/store/products.model";

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

export async function getTop5Invoices(storeId?: string, productId?: string) {
  try {
    const session = await getUserSession();

    await dbConnect();

    // Fallback: If no storeId is provided (e.g., Store Owner), use their session ID
    const sessionId = session.user.id;
    var targetStoreId = "";
    if (session.user.role === "store") {
      const findStoreId = await Store.find({
        userId: new mongoose.Types.ObjectId(sessionId),
      })
        .select("_id")
        .lean();
      targetStoreId = storeId || findStoreId[0]?._id.toString();
    }

    console.log(targetStoreId);

    if (session.user.role === "admin") {
      const findStoreIdFromProduct = await Product.findById(productId)
        .select("storeId")
        .lean();
      if (findStoreIdFromProduct) {
        targetStoreId = findStoreIdFromProduct.storeId.toString();
      }
    }

    console.log("Target Store ID for fetching invoices:", targetStoreId);

    if (!targetStoreId || !mongoose.Types.ObjectId.isValid(targetStoreId)) {
      return { success: false, error: "Could not resolve a valid storeId" };
    }

    const invoices = await ProductInvoice.find({
      storeId: new mongoose.Types.ObjectId(targetStoreId),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .select("_id InvoiceNumber DateInvoiceCame");

    console.log("Raw Invoices from DB:", invoices);

    const serializedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      _id: invoice._id?.toString(),
      InvoiceNumber: invoice.InvoiceNumber,
      DateInvoiceCame: invoice.DateInvoiceCame?.toISOString(),
    }));
    console.log("Top 5 Invoices:", serializedInvoices);

    return { success: true, data: serializedInvoices };
  } catch (error) {
    console.error(`Error fetching the invoices:`, error);
    return { success: false, error: "Failed to fetch invoices" };
  }
}
