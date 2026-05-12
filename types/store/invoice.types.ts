// types/store/invoice.ts

export interface InvoiceDocument {
  _id: string;
  storeId: string;
  vendorName: string;
  InvoiceNumber: number;
  DateInvoiceCame: string; // Must be a string (ISO format) for client serialization
  productNameInInvoice?: string;
  additionalNote?: string;
  documentId: {
    url: string;
    fileId: string;
  };
}

export type GetInvoiceResponse =
  | { success: true; data: InvoiceDocument; }
  | { success: false; message: string };