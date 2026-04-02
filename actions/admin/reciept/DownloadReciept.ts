"use server";

import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import {
  getRecieptDataByDateRange,
  type AggregatedReciept,
} from "@/actions/admin/reciept/generateReciept";

// --- Brand Colors ---
const GREEN_PRIMARY = rgb(0.38, 0.67, 0.35);
const GREEN_LIGHT = rgb(0.91, 0.97, 0.91);
const GREEN_DARK = rgb(0.18, 0.35, 0.22);
const GRAY_LINE = rgb(0.88, 0.93, 0.88);
const MUTED = rgb(0.52, 0.6, 0.54);
const WHITE = rgb(1, 1, 1);
const RED_ALERT = rgb(0.8, 0.2, 0.2);

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

interface ReceiptRowData {
  label: string;
  value: string;
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
}

// --- Helper for wrapping long text (like order IDs) ---
function drawWrappedText(
  page: any,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  color: any,
  minY: number,
) {
  const words = text.split(", ");
  let line = "";
  let currentY = startY;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + (i < words.length - 1 ? ", " : "");
    const textWidth = font.widthOfTextAtSize(testLine, size);

    if (textWidth > maxWidth && line !== "") {
      if (currentY < minY) {
        page.drawText(line + "...", { x, y: currentY, font, size, color });
        return currentY - (size + 4);
      }
      page.drawText(line, { x, y: currentY, font, size, color });
      line = words[i] + (i < words.length - 1 ? ", " : "");
      currentY -= size + 6;
    } else {
      line = testLine;
    }
  }

  if (line && currentY >= minY) {
    page.drawText(line, { x, y: currentY, font, size, color });
    currentY -= size + 6;
  }

  return currentY;
}

async function generateReceiptPDF(
  data: AggregatedReciept,
  startDateIso: string,
  endDateIso: string,
) {
  const pdfDoc = await PDFDocument.create();
  // Standard A4 dimensions
  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const margin = 48;
  const contentWidth = width - margin * 2;

  // --- Header Background ---
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: GREEN_PRIMARY,
  });

  // --- Header Text ---
  page.drawText("Candian's Cart", {
    x: margin,
    y: height - 44,
    font: boldFont,
    size: 22,
    color: WHITE,
  });
  page.drawText("Your trusted Canadian marketplace", {
    x: margin,
    y: height - 62,
    font,
    size: 9,
    color: rgb(0.8, 0.95, 0.8),
  });

  const invoiceLabel = "SETTLEMENT";
  const invoiceLabelW = boldFont.widthOfTextAtSize(invoiceLabel, 26);
  page.drawText(invoiceLabel, {
    x: width - margin - invoiceLabelW,
    y: height - 48,
    font: boldFont,
    size: 26,
    color: WHITE,
  });

  let y = height - 130;

  // --- Helper Functions ---
  const drawLabel = (label: string, value: string, yPos: number) => {
    page.drawText(label, { x: margin, y: yPos, font, size: 9, color: MUTED });
    page.drawText(value, {
      x: margin,
      y: yPos - 14,
      font: boldFont,
      size: 11,
      color: GREEN_DARK,
    });
  };

  const drawLabelRight = (label: string, value: string, yPos: number) => {
    const valW = boldFont.widthOfTextAtSize(value, 11);
    const lblW = font.widthOfTextAtSize(label, 9);
    page.drawText(label, {
      x: width - margin - lblW,
      y: yPos,
      font,
      size: 9,
      color: MUTED,
    });
    page.drawText(value, {
      x: width - margin - valW,
      y: yPos - 14,
      font: boldFont,
      size: 11,
      color: GREEN_DARK,
    });
  };

  const drawRow = (
    label: string,
    value: string,
    yPos: number,
    isBold: boolean = false,
    highlightColor?: ReturnType<typeof rgb>,
  ) => {
    const activeFont = isBold ? boldFont : font;
    const color = highlightColor || GREEN_DARK;

    page.drawText(label, {
      x: margin + 8,
      y: yPos,
      font: activeFont,
      size: 10,
      color,
    });
    const valW = activeFont.widthOfTextAtSize(value, 10);
    page.drawText(value, {
      x: width - margin - valW - 8,
      y: yPos,
      font: activeFont,
      size: 10,
      color,
    });
  };

  // --- Meta Information ---
  drawLabel("STORE ID", String(data._id || "Platform-Wide"), y);

  const formattedStart = new Date(startDateIso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedEnd = new Date(endDateIso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  drawLabelRight("PERIOD", `${formattedStart} - ${formattedEnd}`, y);

  y -= 44;
  drawLabel("TOTAL ORDERS", String(data.orderCount), y);

  y -= 32;
  page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height: 1,
    color: GRAY_LINE,
  });
  y -= 20;

  // --- Section 1: Financial Breakdown ---
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("ORDER BREAKDOWN", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  let rowIndex = 0;

  const breakdownItems: ReceiptRowData[] = [
    {
      label: "Total Customer Paid",
      value: formatMoney(data.totalCustomerPaid || 0),
      bold: true,
    },
    { label: "Total Base Price", value: formatMoney(data.totalBasePrice || 0) },
    { label: "Total GST", value: formatMoney(data.totalGST || 0) },
    { label: "Total PST", value: formatMoney(data.totalPST || 0) },
    {
      label: "Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
    {
      label: "Store Tax Portion (GST)",
      value: formatMoney(data.storebasetaxGST || 0),
      color: RED_ALERT,
    },
    {
      label: "Store Tax Portion (PST)",
      value: formatMoney(data.storebasetaxPST || 0),
      color: RED_ALERT,
    },
  ];

  if (data.totalSubsidy && data.totalSubsidy > 0) {
    breakdownItems.push({
      label: "Subsidies Applied",
      value: `-${formatMoney(data.totalSubsidy)}`,
      bold: false,
      color: RED_ALERT,
    });
  }

  breakdownItems.push({
    label: "Store Fixed Value (Cost)",
    value: formatMoney(data.storeFixedValue || 0),
    bold: true,
  });

  for (const item of breakdownItems) {
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 6,
        width: contentWidth,
        height: 22,
        color: rgb(0.98, 1, 0.98),
      });
    }
    drawRow(item.label, item.value, y, item.bold, item.color);
    y -= 20;
    rowIndex++;
  }

  y -= 8;
  page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height: 1,
    color: GRAY_LINE,
  });
  y -= 20;

  // --- Section 2: Margin & Profit ---
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("PROFIT & MARGINS", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  rowIndex = 0;

  const marginItems: ReceiptRowData[] = [
    {
      label: "Gross Margin",
      value: formatMoney(data.grossMargin || 0),
      bold: true,
    },
    {
      label: "Store Profit (From Markup)",
      value: formatMoney(data.storeProfit || 0),
    },
    {
      label: "Cash Collected (From Orders)",
      value: `-${formatMoney(data.totalOrderCashCollected || 0)}`,
      color: RED_ALERT,
    },
    {
      label: "Cash Collected (From Topups)",
      value: `-${formatMoney(data.totalWalletTopUpCashCollected || 0)}`,
      color: RED_ALERT,
    },
    {
      label: "Platform Markup Tax",
      value: formatMoney(data.platformMarkuptax || 0),
      color: RED_ALERT,
    },
    {
      label: "Platform Commision",
      value: formatMoney(data.platformCommision || 0),
    },
  ];

  for (const item of marginItems) {
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 6,
        width: contentWidth,
        height: 22,
        color: rgb(0.98, 1, 0.98),
      });
    }
    drawRow(item.label, item.value, y, item.bold, item.color);
    y -= 20;
    rowIndex++;
  }

  y -= 12;

  // --- Final Payouts Block ---
  const totalLabelX = width - margin - 220;

  // Store Payout (Green Block)
  page.drawRectangle({
    x: totalLabelX - 12,
    y: y - 8,
    width: width - margin - totalLabelX + 12,
    height: 30,
    color: GREEN_PRIMARY,
  });
  page.drawText("TOTAL STORE PAYOUT", {
    x: totalLabelX,
    y: y + 2,
    font: boldFont,
    size: 11,
    color: WHITE,
  });
  const storePayoutStr = formatMoney(data.storePayout || 0);
  const storePayoutStrW = boldFont.widthOfTextAtSize(storePayoutStr, 13);
  page.drawText(storePayoutStr, {
    x: width - margin - storePayoutStrW,
    y: y + 2,
    font: boldFont,
    size: 13,
    color: WHITE,
  });

  y -= 36;

  // Platform Profit (Dark Green Block)
  page.drawRectangle({
    x: totalLabelX - 12,
    y: y - 8,
    width: width - margin - totalLabelX + 12,
    height: 30,
    color: GREEN_DARK,
  });
  page.drawText("PLATFORM PROFIT", {
    x: totalLabelX,
    y: y + 2,
    font: boldFont,
    size: 11,
    color: WHITE,
  });
  const platformProfitStr = formatMoney(data.platformProfit || 0);
  const platformProfitStrW = boldFont.widthOfTextAtSize(platformProfitStr, 13);
  page.drawText(platformProfitStr, {
    x: width - margin - platformProfitStrW,
    y: y + 2,
    font: boldFont,
    size: 13,
    color: WHITE,
  });

  y -= 36;

  // --- Order IDs Block ---
  if (data.orderIds && data.orderIds.length > 0) {
    page.drawText(`INCLUDED ORDERS (${data.orderIds.length}):`, {
      x: margin,
      y: y,
      font: boldFont,
      size: 9,
      color: GREEN_PRIMARY,
    });
    y -= 14;

    const orderString = data.orderIds.join(", ");
    y = drawWrappedText(
      page,
      orderString,
      margin,
      y,
      contentWidth,
      font,
      7,
      MUTED,
      60,
    );
  }

  // --- Footer ---
  const footerY = 52;
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: footerY,
    color: GREEN_LIGHT,
  });
  page.drawRectangle({ x: 0, y: footerY, width, height: 1, color: GRAY_LINE });

  page.drawText("Thank you for partnering with Candian's Cart!", {
    x: margin,
    y: footerY - 18,
    font,
    size: 9,
    color: MUTED,
  });

  const supportText = "support@candianscart.ca";
  const supportW = font.widthOfTextAtSize(supportText, 9);
  page.drawText(supportText, {
    x: width - margin - supportW,
    y: footerY - 18,
    font,
    size: 9,
    color: GREEN_PRIMARY,
  });

  page.drawText(
    `Receipt generated on ${new Date().toLocaleDateString("en-CA")}`,
    {
      x: margin,
      y: footerY - 32,
      font,
      size: 8,
      color: rgb(0.72, 0.78, 0.72),
    },
  );

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function downloadReceiptPdfAction(
  storeId: string,
  startDateIso: string,
  endDateIso: string,
) {
  const receipts = await getRecieptDataByDateRange({
    startDate: new Date(startDateIso),
    endDate: new Date(endDateIso),
    storeId: storeId ? storeId : undefined,
  });

  const data = Array.isArray(receipts) ? receipts[0] : receipts;

  if (!data) {
    throw new Error("No receipt data found");
  }

  // Pass dates down to display nicely in the PDF
  const pdfBytes = await generateReceiptPDF(data, startDateIso, endDateIso);

  return Buffer.from(pdfBytes).toString("base64");
}

// --- Download saved payouts ---

export interface SavedPayoutData {
  _id: string;
  storeId: string | { _id: string }; // Depending on how it's populated
  startDate: string | Date;
  endDate: string | Date;
  totalNumberofOrders: number; // Added field
  orderIds: string[]; // Added field
  totalCustomerPaid: number;
  totalGST: number;
  totalPST: number;
  baseTax: number; // Added field
  markupTax: number; // Added field
  storebasetaxGST: number; // Added field
  storebasetaxPST: number; // Added field
  platformMarkuptax: number; // Added field
  totalSubsidy: number;
  totalDisposableFee: number;
  storeFixedValue: number;
  storeProfit: number;
  totalCashCollected: number;
  storePayout: number;
  platformProfit: number;
  platformCommision: number;
  totalWalletTopUpCashCollected: number;
  totalOrderCashCollected: number;
  status: "pending" | "paid";
  additionalNote?: string;
  paymentReciept?: {
    url: string;
    fileId: string;
  };
}

export async function downloadSavedPayoutPdfAction(data: SavedPayoutData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 48;
  const contentWidth = width - margin * 2;

  // --- Header Background ---
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: GREEN_PRIMARY,
  });

  // --- Header Text ---
  page.drawText("Candian's Cart", {
    x: margin,
    y: height - 44,
    font: boldFont,
    size: 22,
    color: WHITE,
  });
  page.drawText("Store Payout Details", {
    x: margin,
    y: height - 62,
    font,
    size: 9,
    color: rgb(0.8, 0.95, 0.8),
  });

  const invoiceLabel = data.status === "paid" ? "PAID RECEIPT" : "SETTLEMENT";
  const invoiceLabelW = boldFont.widthOfTextAtSize(invoiceLabel, 22);
  page.drawText(invoiceLabel, {
    x: width - margin - invoiceLabelW,
    y: height - 48,
    font: boldFont,
    size: 22,
    color: WHITE,
  });

  let y = height - 130;

  // --- Helper Functions ---
  const drawLabel = (label: string, value: string, yPos: number) => {
    page.drawText(label, { x: margin, y: yPos, font, size: 9, color: MUTED });
    page.drawText(value, {
      x: margin,
      y: yPos - 14,
      font: boldFont,
      size: 11,
      color: GREEN_DARK,
    });
  };

  const drawLabelRight = (label: string, value: string, yPos: number) => {
    const valW = boldFont.widthOfTextAtSize(value, 11);
    const lblW = font.widthOfTextAtSize(label, 9);
    page.drawText(label, {
      x: width - margin - lblW,
      y: yPos,
      font,
      size: 9,
      color: MUTED,
    });
    page.drawText(value, {
      x: width - margin - valW,
      y: yPos - 14,
      font: boldFont,
      size: 11,
      color: GREEN_DARK,
    });
  };

  const drawRow = (
    label: string,
    value: string,
    yPos: number,
    isBold: boolean = false,
    customColor?: ReturnType<typeof rgb>,
  ) => {
    const activeFont = isBold ? boldFont : font;
    const color = customColor || GREEN_DARK;
    page.drawText(label, {
      x: margin + 8,
      y: yPos,
      font: activeFont,
      size: 10,
      color,
    });
    const valW = activeFont.widthOfTextAtSize(value, 10);
    page.drawText(value, {
      x: width - margin - valW - 8,
      y: yPos,
      font: activeFont,
      size: 10,
      color,
    });
  };

  // --- Meta Information ---
  const storeIdStr =
    typeof data.storeId === "object" && data.storeId !== null
      ? String(data.storeId._id)
      : String(data.storeId);
  drawLabel("PAYMENT ID", String(data._id), y);

  const formattedStart = new Date(data.startDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedEnd = new Date(data.endDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  drawLabelRight("PERIOD", `${formattedStart} - ${formattedEnd}`, y);

  y -= 44;
  drawLabel("STORE ID", storeIdStr, y);
  drawLabelRight("PAYMENT STATUS", data.status.toUpperCase(), y);

  y -= 44;
  drawLabel("TOTAL ORDERS", String(data.totalNumberofOrders || 0), y);

  y -= 32;
  page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height: 1,
    color: GRAY_LINE,
  });
  y -= 20;

  // --- Section 1: Financial Breakdown ---
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("ORDER BREAKDOWN", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  const breakdownItems: ReceiptRowData[] = [
    {
      label: "Total Customer Paid",
      value: formatMoney(data.totalCustomerPaid || 0),
      bold: true,
    },
    { label: "Total GST", value: formatMoney(data.totalGST || 0) },
    { label: "Total PST", value: formatMoney(data.totalPST || 0) },
    {
      label: "Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
    {
      label: "Store Tax Portion (GST)",
      value: formatMoney(data.storebasetaxGST || 0),
      color: RED_ALERT,
    },
    {
      label: "Store Tax Portion (PST)",
      value: formatMoney(data.storebasetaxPST || 0),
      color: RED_ALERT,
    },
  ];

  if (data.totalSubsidy && data.totalSubsidy > 0) {
    breakdownItems.push({
      label: "Subsidies Applied",
      value: `-${formatMoney(data.totalSubsidy)}`,
      color: RED_ALERT,
    });
  }

  breakdownItems.push({
    label: "Store Fixed Value (Cost)",
    value: formatMoney(data.storeFixedValue || 0),
    bold: true,
  });

  let rowIndex = 0;
  for (const item of breakdownItems) {
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 6,
        width: contentWidth,
        height: 22,
        color: rgb(0.98, 1, 0.98),
      });
    }
    drawRow(item.label, item.value, y, item.bold, item.color);
    y -= 20;
    rowIndex++;
  }

  // --- Section 2: Margin & Adjustments ---
  y -= 8;
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("MARGINS & ADJUSTMENTS", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  const marginItems: ReceiptRowData[] = [
    {
      label: "Store Profit (Margin)",
      value: formatMoney(data.storeProfit || 0),
    },
    {
      label: "Cash Collected (From Orders)",
      value: `-${formatMoney(data.totalOrderCashCollected || 0)}`,
      color: RED_ALERT,
    },
    {
      label: "Cash Collected (From Topups)",
      value: `-${formatMoney(data.totalWalletTopUpCashCollected || 0)}`,
      color: RED_ALERT,
    },
    {
      label: "Total Cash Collected",
      value: `-${formatMoney(data.totalCashCollected || 0)}`,
      bold: true,
      color: RED_ALERT,
    },
    {
      label: "Platform Markup Tax",
      value: formatMoney(data.platformMarkuptax || 0),
      color: RED_ALERT,
    },
    {
      label: "Platform Commission",
      value: formatMoney(data.platformCommision || 0),
    },
  ];

  rowIndex = 0;
  for (const item of marginItems) {
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 6,
        width: contentWidth,
        height: 22,
        color: rgb(0.98, 1, 0.98),
      });
    }
    drawRow(item.label, item.value, y, item.bold, item.color);
    y -= 20;
    rowIndex++;
  }

  // --- Section 3: Payment Details & Notes ---
  y -= 8;
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("PAYMENT DETAILS", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 24;

  if (data.additionalNote) {
    page.drawText("Notes:", {
      x: margin + 8,
      y,
      font: boldFont,
      size: 10,
      color: GREEN_DARK,
    });
    page.drawText(
      data.additionalNote.slice(0, 85) +
        (data.additionalNote.length > 85 ? "..." : ""),
      { x: margin + 50, y, font, size: 10, color: GREEN_DARK },
    );
    y -= 24;
  }

  if (data.paymentReciept?.url) {
    page.drawText("Receipt Document:", {
      x: margin + 8,
      y,
      font: boldFont,
      size: 10,
      color: GREEN_DARK,
    });
    page.drawText(data.paymentReciept.url, {
      x: margin + 100,
      y,
      font,
      size: 9,
      color: rgb(0.1, 0.4, 0.8),
    });
    y -= 24;
  }

  // --- Final Payouts Block ---
  y -= 12;
  const totalLabelX = width - margin - 220;

  page.drawRectangle({
    x: totalLabelX - 12,
    y: y - 8,
    width: width - margin - totalLabelX + 12,
    height: 30,
    color: GREEN_PRIMARY,
  });
  page.drawText("TOTAL STORE PAYOUT", {
    x: totalLabelX,
    y: y + 2,
    font: boldFont,
    size: 11,
    color: WHITE,
  });
  const storePayoutStr = formatMoney(data.storePayout || 0);
  const storePayoutStrW = boldFont.widthOfTextAtSize(storePayoutStr, 13);
  page.drawText(storePayoutStr, {
    x: width - margin - storePayoutStrW,
    y: y + 2,
    font: boldFont,
    size: 13,
    color: WHITE,
  });

  y -= 36;
  page.drawRectangle({
    x: totalLabelX - 12,
    y: y - 8,
    width: width - margin - totalLabelX + 12,
    height: 30,
    color: GREEN_DARK,
  });
  page.drawText("PLATFORM PROFIT", {
    x: totalLabelX,
    y: y + 2,
    font: boldFont,
    size: 11,
    color: WHITE,
  });
  const platformProfitStr = formatMoney(data.platformProfit || 0);
  const platformProfitStrW = boldFont.widthOfTextAtSize(platformProfitStr, 13);
  page.drawText(platformProfitStr, {
    x: width - margin - platformProfitStrW,
    y: y + 2,
    font: boldFont,
    size: 13,
    color: WHITE,
  });

  y -= 36;

  // --- Order IDs Block ---
  if (data.orderIds && data.orderIds.length > 0) {
    page.drawText(
      `INCLUDED ORDERS (${data.totalNumberofOrders || data.orderIds.length}):`,
      {
        x: margin,
        y: y,
        font: boldFont,
        size: 9,
        color: GREEN_PRIMARY,
      },
    );
    y -= 14;

    const orderString = data.orderIds.join(", ");
    y = drawWrappedText(
      page,
      orderString,
      margin,
      y,
      contentWidth,
      font,
      7,
      MUTED,
      60,
    );
  }

  // --- Footer ---
  const footerY = 52;
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: footerY,
    color: GREEN_LIGHT,
  });
  page.drawRectangle({ x: 0, y: footerY, width, height: 1, color: GRAY_LINE });

  page.drawText("Thank you for partnering with Candian's Cart!", {
    x: margin,
    y: footerY - 18,
    font,
    size: 9,
    color: MUTED,
  });

  page.drawText(
    `Receipt generated on ${new Date().toLocaleDateString("en-CA")}`,
    {
      x: margin,
      y: footerY - 32,
      font,
      size: 8,
      color: rgb(0.72, 0.78, 0.72),
    },
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
