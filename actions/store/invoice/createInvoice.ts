"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import ProductInvoice from "@/db/models/store/invoice.model";
import { InvoiceFormSchema } from "@/zod/schemas/store/addProductsValidation";
import { z } from "zod";
import { zodErrorResponse } from "@/zod/validation/error";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import ImageKit from "@imagekit/nodejs";
import ProductsModel from "@/db/models/store/products.model";
import { GetInvoiceResponse } from "@/types/store/invoice.types";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export type InvoiceFormValue = z.infer<typeof InvoiceFormSchema>;

interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  linkedProducts?: { productId: string; productName: string }[];
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

export async function editInvoice(
  invoiceId: string,
  data: InvoiceFormValue,
): Promise<ActionResponse> {
  try {
    await getUserSession();

    const validationResult = InvoiceFormSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }
    await dbConnect();
    const existingInvoice = await ProductInvoice.findById(invoiceId);
    if (!existingInvoice) {
      return { success: false, message: "Could not find the invoice" };
    }

    const oldFileId = existingInvoice.documentId?.fileId;
    const newFileId = validationResult.data.document?.fileId;

    const updatedInvoice = await ProductInvoice.findByIdAndUpdate(
      invoiceId,
      {
        vendorName: validationResult.data.vendorName,
        InvoiceNumber: validationResult.data.invoiceNumber,
        DateInvoiceCame: validationResult.data.dateInvoiceCame,
        AdditionalNote: validationResult.data.additionalNote,
        productNameInInvoice: validationResult.data.productNameInInvoice,
        documentId: validationResult.data.document,
      },
      { returnDocument: "after" },
    );
    if (!updatedInvoice) {
      return { success: false, message: "Could not find the invoice" };
    }

    if (oldFileId && newFileId && oldFileId !== newFileId) {
      try {
        await imagekit.files.delete(oldFileId);
        console.log(
          `Successfully deleted old image ${oldFileId} from ImageKit`,
        );
      } catch (err) {
        console.error(
          `Failed to delete old image ${oldFileId} from ImageKit:`,
          err,
        );
      }
    }
    revalidatePath("/store/invoice");

    return {
      success: true,
      message: "Invoice updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occured while editing the invoice",
    };
  }
}

export async function getProductsLinkedToInvoice(invoiceId: string) {
  try {
    console.log("Fetching products linked to invoice:", invoiceId);

    await dbConnect();

    console.log("Searching for Invoice ID:", invoiceId);

    const objectId = new mongoose.Types.ObjectId(invoiceId);

    console.log("Searching for Invoice ID (ObjectId):", objectId);

    const productsUsingInvoice = await ProductsModel.find({
      InvoiceId: objectId,
    })
      .select("_id name")
      .lean();

    console.log("Products: ", productsUsingInvoice);

    const serializedProducts = productsUsingInvoice.map((product: any) => ({
      productId: product._id.toString(),
      productName: product.name,
    }));
    return {
      success: true,
      data: serializedProducts,
    };
  } catch (error) {
    console.error("Error fetching products linked to invoice:", error);
    return {
      success: false,
      message: "An error occurred while fetching linked products",
    };
  }
}

export async function getInvoiceById(invoiceId: string): Promise<GetInvoiceResponse> {
  try {
    const session = await getUserSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    const invoice = await ProductInvoice.findById(invoiceId).lean();

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    // Serialize to pass React Client Boundary
    return {
      success: true,
      data: {
        _id: invoice._id.toString(),
        storeId: invoice.storeId.toString(),
        vendorName: invoice.vendorName,
        InvoiceNumber: invoice.InvoiceNumber,
        // Format date to YYYY-MM-DD for the HTML date input
        DateInvoiceCame: new Date(invoice.DateInvoiceCame)
          .toISOString()
          .split("T")[0],
        productNameInInvoice: invoice.productNameInInvoice || "",
        additionalNote: invoice.additionalNote || "",
        documentId: {
          url: invoice.documentId.url,
          fileId: invoice.documentId.fileId,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return { success: false, message: "Server error fetching invoice" };
  }
}

export async function deleteInvoice(
  invoiceId: string,
): Promise<ActionResponse> {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized, Only admin can delete an invoice",
      };
    }
    await dbConnect();

    const deletedInvoice = await ProductInvoice.findByIdAndDelete(invoiceId);
    if (!deletedInvoice) {
      return { success: false, message: "Could not find the invoice" };
    }

    const fileIdToDelete = deletedInvoice.documentId?.fileId;

    if (fileIdToDelete) {
      try {
        await imagekit.files.delete(fileIdToDelete);
        console.log(
          `Successfully deleted image ${fileIdToDelete} from ImageKit`,
        );
      } catch (imageKitError) {
        console.error(
          `Failed to delete image ${fileIdToDelete} from ImageKit:`,
          imageKitError,
        );
      }
    }

    return {
      success: true,
      message: "Invoice deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occured while deleting the invoice",
    };
  }
}
