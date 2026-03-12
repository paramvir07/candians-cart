"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import ProductInvoice from "@/db/models/store/invoice.model";
import { InvoiceFormSchema } from "@/zod/schemas/store/addProductsValidation";
import { z } from "zod";
import { zodErrorResponse } from "@/zod/validation/error";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export type InvoiceFormValue = z.infer<typeof InvoiceFormSchema>;

interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createInvoice(
  data: InvoiceFormValue,
  storeId: string,
): Promise<ActionResponse> {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, message: "Unauthorized" };
    }
    const validationResult = InvoiceFormSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

    await dbConnect();

    const {
      vendorName,
      invoiceNumber,
      dateInvoiceCame,
      productNameInInvoice,
      additionalNote,
      document,
    } = validationResult.data;

    const invoice = await ProductInvoice.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      vendorName,
      InvoiceNumber: invoiceNumber,
      DateInvoiceCame: dateInvoiceCame,
      productNameInInvoice,
      additionalNote,
      documentId: document,
    });

    if (!invoice) {
      return { success: false, message: "Could not find the invoice" };
    }

    revalidatePath("/store/invoice");
    return {
      success: true,
      message: "Invoice uploaded successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occured while uploading the invoice",
    };
  }
}
