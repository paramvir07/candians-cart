"use server";

import { dbConnect } from "@/db/dbConnect";
import { revalidatePath } from "next/cache";
import ProductInvoice from "@/db/models/store/invoice.model";
import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";

export type PriceChangeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SerializedPriceChangeLog {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images?: { url: string; fileId: string }[];
  } | null;
  oldPrice?: number;
  newPrice: number;
  status: PriceChangeStatus;
}
export interface SerializedInvoiceWithChanges {
  _id: string;
  vendorName: string;
  InvoiceNumber: number;
  createdAt: string;
  documentId: { url: string; fileId: string };
  products: SerializedPriceChangeLog[];
}

export interface SerializedGlobalInvoiceWithChanges extends SerializedInvoiceWithChanges {
  store: {
    _id: string;
    name: string;
  } | null;
}

export async function getInvoiceWithPriceChange(storeId: string) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }
    await dbConnect();

    const invoices = await ProductInvoice.find({
      storeId: storeId,
      "products.status": "PENDING",
    })
      .populate({
        path: "products.productId",
        select: "name images _id", // taking the name and the _id of the product
        model: Product,
      })
      .sort({ createdAt: -1 })
      .lean();

    const serializedData: SerializedInvoiceWithChanges[] = invoices.map(
      (inv: any) => ({
        _id: inv._id.toString(),
        vendorName: inv.vendorName,
        InvoiceNumber: inv.InvoiceNumber,
        createdAt: inv.createdAt.toISOString(),
        documentId: {
          url: inv.documentId.url,
          fileId: inv.documentId.fileId,
        },
        products: inv.products.map((p: any) => ({
          _id: p._id.toString(),
          productId: p.productId
            ? {
                _id: p.productId._id.toString(),
                name: p.productId.name,
                images:
                  p.productId.images?.map((img: any) => ({
                    url: img.url,
                    fileId: img.fileId,
                  })) || [],
              }
            : null,
          oldPrice: p.oldPrice,
          newPrice: p.newPrice,
          status: p.status || "PENDING",
        })),
      }),
    );

    return {
      success: true,
      message: "Fetched successfully",
      data: serializedData,
    };
  } catch (error) {
    console.log(
      `Encountered error while fetching invoice with price change: ${error}`,
    );
    return { success: false, message: "Server Error", data: null };
  }
}

export async function getAllInvoicesWithPriceChange() {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }
    await dbConnect();

    const invoices = await ProductInvoice.find({})
      .populate({
        path: "storeId",
        select: "name _id",
        model: Store,
      })
      .populate({
        path: "products.productId",
        select: "name images _id",
        model: Product,
      })
      .sort({ createdAt: -1 })
      .lean();

    const serializedData: SerializedGlobalInvoiceWithChanges[] = invoices.map(
      (inv: any) => ({
        _id: inv._id.toString(),
        // Attach the store name
        store: inv.storeId
          ? {
              _id: inv.storeId._id.toString(),
              name: inv.storeId.name,
            }
          : null,
        vendorName: inv.vendorName,
        InvoiceNumber: inv.InvoiceNumber,
        createdAt: inv.createdAt.toISOString(),
        documentId: {
          url: inv.documentId.url,
          fileId: inv.documentId.fileId,
        },
        products: inv.products.map((p: any) => ({
          _id: p._id.toString(),
          productId: p.productId
            ? {
                _id: p.productId._id.toString(),
                name: p.productId.name,
                images:
                  p.productId.images?.map((img: any) => ({
                    url: img.url,
                    fileId: img.fileId,
                  })) || [],
              }
            : null,
          oldPrice: p.oldPrice,
          newPrice: p.newPrice,
          status: p.status || "PENDING",
        })),
      }),
    );
    return {
      success: true,
      message: "Fetched successfully",
      data: serializedData,
    };
  } catch (error) {
    console.error(`Encountered error while fetching all invoices:`, error);
    return { success: false, message: "Server Error", data: null };
  }
}

export async function resolvePriceChange(
  invoiceId: string,
  logId: string, // Specific _id of the product array item
  status: "APPROVED" | "REJECTED",
) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }
    await dbConnect();

    const invoice = await ProductInvoice.findOne({
      _id: invoiceId,
      "products._id": logId,
    });
    if (!invoice) {
      return { success: false, message: "Invoice log not found" };
    }
    const log = invoice.products.find((p: any) => p._id.toString() === logId);
    if (!log || log.status !== "PENDING") {
      return {
        success: false,
        message: "This change is no longer pending",
      };
    }

    await ProductInvoice.findOneAndUpdate(
      { _id: invoiceId, "products._id": logId },
      { $set: { "products.$.status": status } },
    );
    revalidatePath(`/admin/store/${invoice.storeId}/products/price-changes`);

    return {
      success: true,
      message: `Price change ${status.toLowerCase()} successfully.`,
    };
  } catch (error) {
    console.log(`Encountered Error: `, error);
    return {
      success: false,
      message: "Server error while resolving price change.",
    };
  }
}


export async function getPendingPriceChangesCount() {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return 0;
    }
    
    await dbConnect();

    // We use aggregate to unwind the products array and count the exact number of pending items
    const result = await ProductInvoice.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "PENDING" } },
      { $count: "totalPending" }
    ]);

    return result.length > 0 ? result[0].totalPending : 0;
  } catch (error) {
    console.error("Error counting pending invoices:", error);
    return 0;
  }
}