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
        await imagekit.delete(oldFileId);
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
    const session = await getUserSession();

    // Security check: Only admins can perform this action
    if (!session?.user?.id || session.user.role !== "Admin") {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    const productsUsingInvoice = await ProductsModel.find({
      InvoiceId: invoiceId,
    })
      .select("_id name")
      .lean();

    const serializedProducts = productsUsingInvoice.map((product: any) => ({
      _id: product._id.toString(),
      name: product.name,
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

export async function deleteInvoice(
  invoiceId: string,
): Promise<ActionResponse> {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role !== "Admin") {
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
        await imagekit.delete(fileIdToDelete);
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
