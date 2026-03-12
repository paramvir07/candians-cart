"use server";

import { dbConnect } from "@/db/dbConnect";
import { revalidatePath } from "next/cache";
import ProductInvoice from "@/db/models/store/invoice.model";
import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export async function getInvoiceWithPriceChange(storeId: string) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }
    await dbConnect();

    const invoice = await ProductInvoice.find({
      storeId: storeId,
      "products.status": "PENDING",
    })
      .populate({
        path: "products.productId",
        select: "name _id", // taking the name and the _id of the product
        model: Product,
      })
      .sort({ createdAt: -1 })
      .lean();

    const filteredInvoices = invoice.map((inv: any) => ({
      ...inv,
      products: inv.products.filter((p: any) => p.status === "PENDING"),
    }));

    const serializedData = JSON.parse(JSON.stringify(filteredInvoices));

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

    if (status === "APPROVED") {
      await ProductInvoice.findOneAndUpdate(
        { _id: invoiceId, "products._id": logId },
        { $set: { "products.$.status": status } },
      );
    }
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
