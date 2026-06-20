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

// ============================================================================
// 1. GENERATE GENERIC RECEIPT PDF (Unsaved / Preview)
// ============================================================================

async function generateReceiptPDF(
  data: AggregatedReciept,
  startDateIso: string,
  endDateIso: string,
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 48;
  const contentWidth = width - margin * 2;

  // --- Header / Footer Helpers ---
  const drawHeader = (targetPage: any, title: string) => {
    targetPage.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: GREEN_PRIMARY,
    });
    targetPage.drawText("Candian's Cart", {
      x: margin,
      y: height - 44,
      font: boldFont,
      size: 22,
      color: WHITE,
    });
    targetPage.drawText("Your trusted Canadian marketplace", {
      x: margin,
      y: height - 62,
      font,
      size: 9,
      color: rgb(0.8, 0.95, 0.8),
    });
    const titleW = boldFont.widthOfTextAtSize(title, 26);
    targetPage.drawText(title, {
      x: width - margin - titleW,
      y: height - 48,
      font: boldFont,
      size: 26,
      color: WHITE,
    });
  };

  const drawFooter = (targetPage: any) => {
    const footerY = 52;
    targetPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerY,
      color: GREEN_LIGHT,
    });
    targetPage.drawRectangle({
      x: 0,
      y: footerY,
      width,
      height: 1,
      color: GRAY_LINE,
    });
    targetPage.drawText("Thank you for partnering with Candian's Cart!", {
      x: margin,
      y: footerY - 18,
      font,
      size: 9,
      color: MUTED,
    });
    const supportText = "info@canadianscart.ca";
    const supportW = font.widthOfTextAtSize(supportText, 9);
    targetPage.drawText(supportText, {
      x: width - margin - supportW,
      y: footerY - 18,
      font,
      size: 9,
      color: GREEN_PRIMARY,
    });
    targetPage.drawText(
      `Receipt generated on ${new Date().toLocaleDateString("en-CA")}`,
      {
        x: margin,
        y: footerY - 32,
        font,
        size: 8,
        color: rgb(0.72, 0.78, 0.72),
      },
    );
  };

  // Build Page 1 (Financials)
  drawHeader(page, "SETTLEMENT");

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

  const drawSection = (title: string, items: ReceiptRowData[]) => {
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: contentWidth,
      height: 20,
      color: GREEN_LIGHT,
    });
    page.drawText(title, {
      x: margin + 8,
      y: y + 3,
      font: boldFont,
      size: 8,
      color: GREEN_PRIMARY,
    });
    y -= 18;
    let rowIndex = 0;
    for (const item of items) {
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - 6,
          width: contentWidth,
          height: 18,
          color: rgb(0.98, 1, 0.98),
        });
      }
      drawRow(item.label, item.value, y, item.bold, item.color);
      y -= 18;
      rowIndex++;
    }
    y -= 6;
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

  drawLabel(
    "TOTAL REVENUE",
    formatMoney((data.totalCustomerPaid || 0) + (data.totalSubsidy || 0)),
    y,
  );
  drawLabelRight("TOTAL ORDERS", String(data.orderCount), y);

  y -= 32;
  page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height: 1,
    color: GRAY_LINE,
  });
  y -= 16;

  // --- Data Definitions for Sections ---
  const orderBreakdownItems: ReceiptRowData[] = [
    { label: "Total Base Price", value: formatMoney(data.totalBasePrice || 0) },
    { label: "Total GST", value: formatMoney(data.totalGST || 0) },
    { label: "Total PST", value: formatMoney(data.totalPST || 0) },
    {
      label: "Total Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
  ];

  const storeBreakdownItems: ReceiptRowData[] = [
    { label: "Total Base Price", value: formatMoney(data.totalBasePrice || 0) },
    {
      label: "Store GST",
      value: formatMoney(
        (data.storebasetaxGST || 0) + (data.storeMarkupTax || 0),
      ),
    },
    { label: "Store PST", value: formatMoney(data.storebasetaxPST || 0) },
    {
      label: "Total Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
    {
      label: "Store Profit (50%)",
      value: formatMoney(data.storeProfit || 0),
      color: GREEN_PRIMARY,
    },
    {
      label: "Total Cash Collected",
      value: `-${formatMoney(data.totalWalletTopUpCashCollected || 0)}`,
      color: MUTED,
    },
    {
      label: "Total Store Payout",
      value: formatMoney(data.storePayout || 0),
      bold: true,
      color: GREEN_PRIMARY,
    },
  ];

  const profitMarginItems: ReceiptRowData[] = [
    {
      label: "Total Profit Margin",
      value: formatMoney((data.grossMargin || 0) + (data.totalSubsidy || 0)),
      bold: true,
    },
    {
      label: "Subsidy",
      value: formatMoney(data.totalSubsidy || 0),
      color: RED_ALERT,
    },
    {
      label: "Store Profit (50%)",
      value: formatMoney(data.storeProfit || 0),
      color: GREEN_PRIMARY,
    },
    {
      label: "Platform Profit",
      value: formatMoney(data.platformProfit || 0),
      color: GREEN_PRIMARY,
    },
  ];

  const platformBreakdownItems: ReceiptRowData[] = [
    {
      label: "Platform GST",
      value: formatMoney(
        (data as any).platformMarkupGSTTax || data.platformMarkuptax || 0,
      ),
    },
    {
      label: "Platform PST",
      value: formatMoney((data as any).platformMarkupPSTTax || 0),
    },
    {
      label: "Platform Profit",
      value: formatMoney(data.platformProfit || 0),
      bold: true,
      color: GREEN_PRIMARY,
    },
  ];

  // --- Draw Sections ---
  drawSection("ORDER BREAKDOWN", orderBreakdownItems);
  drawSection("STORE BREAKDOWN", storeBreakdownItems);
  drawSection("PROFIT & MARGINS", profitMarginItems);
  drawSection("PLATFORM BREAKDOWN", platformBreakdownItems);

  // --- Final Payouts Block ---
  y -= 8;
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

  drawFooter(page);

  // --- Build Page 2 (Appendix: Orders) ---
  if (data.orderIds && data.orderIds.length > 0) {
    const extraPage = pdfDoc.addPage([595, 842]);
    drawHeader(extraPage, "APPENDIX");
    let extraY = height - 130;

    extraPage.drawRectangle({
      x: margin,
      y: extraY - 4,
      width: contentWidth,
      height: 20,
      color: GREEN_LIGHT,
    });
    extraPage.drawText(`INCLUDED ORDERS (${data.orderIds.length})`, {
      x: margin + 8,
      y: extraY + 3,
      font: boldFont,
      size: 8,
      color: GREEN_PRIMARY,
    });
    extraY -= 18;

    const orderString = data.orderIds.join(", ");
    drawWrappedText(
      extraPage,
      orderString,
      margin,
      extraY,
      contentWidth,
      font,
      8,
      MUTED,
      60,
    );

    drawFooter(extraPage);
  }

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

  const pdfBytes = await generateReceiptPDF(data, startDateIso, endDateIso);
  return Buffer.from(pdfBytes).toString("base64");
}

// ============================================================================
// 2. GENERATE SAVED PAYOUT PDF (Contains Notes / Status)
// ============================================================================

export interface SavedPayoutData {
  _id: string;
  storeId: string | { _id: string }; // Depending on how it's populated
  startDate: string | Date;
  endDate: string | Date;
  totalNumberofOrders: number;
  orderCount?: number;
  orderIds: string[];
  totalCustomerPaid: number;
  totalGST: number;
  totalPST: number;
  baseTax: number;
  markupTax: number;
  storebasetaxGST: number;
  storebasetaxPST: number;
  platformMarkuptax?: number; // legacy
  platformMarkupGSTTax?: number;
  platformMarkupPSTTax?: number;
  grossMargin?: number;
  totalSubsidy: number;
  totalDisposableFee: number;
  storeFixedValue: number;
  storeProfit: number;
  totalCashCollected: number;
  storePayout: number;
  platformProfit: number;
  platformCommision: number;
  totalWalletTopUpCashCollected: number;
  status: "pending" | "paid";
  additionalNote?: string;
  additionalPrice?: number;
  storeMarkupTax: number;
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

  // --- Header / Footer Helpers ---
  const drawHeader = (targetPage: any, title: string) => {
    targetPage.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: GREEN_PRIMARY,
    });
    targetPage.drawText("Candian's Cart", {
      x: margin,
      y: height - 44,
      font: boldFont,
      size: 22,
      color: WHITE,
    });
    targetPage.drawText("Store Payout Details", {
      x: margin,
      y: height - 62,
      font,
      size: 9,
      color: rgb(0.8, 0.95, 0.8),
    });
    const titleW = boldFont.widthOfTextAtSize(title, 22);
    targetPage.drawText(title, {
      x: width - margin - titleW,
      y: height - 48,
      font: boldFont,
      size: 22,
      color: WHITE,
    });
  };

  const drawFooter = (targetPage: any) => {
    const footerY = 52;
    targetPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerY,
      color: GREEN_LIGHT,
    });
    targetPage.drawRectangle({
      x: 0,
      y: footerY,
      width,
      height: 1,
      color: GRAY_LINE,
    });
    targetPage.drawText("Thank you for partnering with Candian's Cart!", {
      x: margin,
      y: footerY - 18,
      font,
      size: 9,
      color: MUTED,
    });
    targetPage.drawText(
      `Receipt generated on ${new Date().toLocaleDateString("en-CA")}`,
      {
        x: margin,
        y: footerY - 32,
        font,
        size: 8,
        color: rgb(0.72, 0.78, 0.72),
      },
    );
  };

  // Build Page 1 (Financials)
  const mainTitle = data.status === "paid" ? "PAID RECEIPT" : "SETTLEMENT";
  drawHeader(page, mainTitle);

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

  const drawSection = (title: string, items: ReceiptRowData[]) => {
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: contentWidth,
      height: 20,
      color: GREEN_LIGHT,
    });
    page.drawText(title, {
      x: margin + 8,
      y: y + 3,
      font: boldFont,
      size: 8,
      color: GREEN_PRIMARY,
    });
    y -= 18;
    let rowIndex = 0;
    for (const item of items) {
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - 6,
          width: contentWidth,
          height: 18,
          color: rgb(0.98, 1, 0.98),
        });
      }
      drawRow(item.label, item.value, y, item.bold, item.color);
      y -= 18;
      rowIndex++;
    }
    y -= 6;
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
  drawLabel(
    "TOTAL REVENUE",
    formatMoney((data.totalCustomerPaid || 0) + (data.totalSubsidy || 0)),
    y,
  );
  drawLabelRight(
    "TOTAL ORDERS",
    String(data.totalNumberofOrders || data.orderCount || 0),
    y,
  );

  y -= 32;
  page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height: 1,
    color: GRAY_LINE,
  });
  y -= 16;

  // --- Data Definitions for Sections ---
  const orderBreakdownItems: ReceiptRowData[] = [
    {
      label: "Total Base Price",
      value: formatMoney((data as any).totalBasePrice || 0),
    },
    { label: "Total GST", value: formatMoney(data.totalGST || 0) },
    { label: "Total PST", value: formatMoney(data.totalPST || 0) },
    {
      label: "Total Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
  ];

  const storeBreakdownItems: ReceiptRowData[] = [
    {
      label: "Total Base Price",
      value: formatMoney((data as any).totalBasePrice || 0),
    },
    {
      label: "Store GST",
      value: formatMoney(data.storebasetaxGST + data.storeMarkupTax),
    },
    { label: "Store PST", value: formatMoney(data.storebasetaxPST || 0) },
    {
      label: "Total Disposable Fees",
      value: formatMoney(data.totalDisposableFee || 0),
    },
    {
      label: "Store Profit (50%)",
      value: formatMoney(data.storeProfit || 0),
      color: GREEN_PRIMARY,
    },
    {
      label: "Total Cash Collected",
      value: `-${formatMoney(data.totalWalletTopUpCashCollected || 0)}`,
      color: MUTED,
    },
    {
      label: "Total Store Payout",
      value: formatMoney(data.storePayout || 0),
      bold: true,
      color: GREEN_PRIMARY,
    },
  ];

  const profitMarginItems: ReceiptRowData[] = [
    {
      label: "Total Profit Margin",
      value: formatMoney((data.grossMargin || 0) + (data.totalSubsidy || 0)),
      bold: true,
    },
    {
      label: "Subsidy",
      value: formatMoney(data.totalSubsidy || 0),
      color: RED_ALERT,
    },
    {
      label: "Store Profit (50%)",
      value: formatMoney(data.storeProfit || 0),
      color: GREEN_PRIMARY,
    },
    {
      label: "Platform Profit",
      value: formatMoney(data.platformProfit || 0),
      color: GREEN_PRIMARY,
    },
  ];

  const platformBreakdownItems: ReceiptRowData[] = [
    {
      label: "Platform GST",
      value: formatMoney(
        data.platformMarkupGSTTax || data.platformMarkuptax || 0,
      ),
    },
    {
      label: "Platform PST",
      value: formatMoney(data.platformMarkupPSTTax || 0),
    },
    {
      label: "Platform Profit",
      value: formatMoney(data.platformProfit || 0),
      bold: true,
      color: GREEN_PRIMARY,
    },
  ];

  // --- Draw Sections ---
  drawSection("ORDER BREAKDOWN", orderBreakdownItems);
  drawSection("STORE BREAKDOWN", storeBreakdownItems);
  drawSection("PROFIT & MARGINS", profitMarginItems);
  drawSection("PLATFORM BREAKDOWN", platformBreakdownItems);

  // --- Final Payouts Block ---
  y -= 8;
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

  drawFooter(page);

  // --- Build Page 2 (Appendix: Notes & Orders) ---
  const hasNotes = !!data.additionalNote || !!data.paymentReciept?.url;
  const hasOrders = data.orderIds && data.orderIds.length > 0;

  if (hasNotes || hasOrders) {
    const extraPage = pdfDoc.addPage([595, 842]);
    drawHeader(extraPage, "APPENDIX");
    let extraY = height - 130;

    // --- Additional Notes & Documents ---
    if (hasNotes) {
      extraPage.drawRectangle({
        x: margin,
        y: extraY - 4,
        width: contentWidth,
        height: 20,
        color: GREEN_LIGHT,
      });
      extraPage.drawText("PAYMENT DETAILS & NOTES", {
        x: margin + 8,
        y: extraY + 3,
        font: boldFont,
        size: 8,
        color: GREEN_PRIMARY,
      });
      extraY -= 22;

      if (data.additionalNote) {
        extraPage.drawText("Notes:", {
          x: margin + 8,
          y: extraY,
          font: boldFont,
          size: 10,
          color: GREEN_DARK,
        });

        // Wrap notes so they don't flow off the page
        extraY = drawWrappedText(
          extraPage,
          data.additionalNote,
          margin + 50,
          extraY,
          contentWidth - 60,
          font,
          10,
          GREEN_DARK,
          60,
        );
        extraY -= 12; // Extra padding
      }

      if (data.paymentReciept?.url) {
        extraPage.drawText("Receipt Document:", {
          x: margin + 8,
          y: extraY,
          font: boldFont,
          size: 10,
          color: GREEN_DARK,
        });

        // If the URL is extremely long, we slice it to prevent it from running off the PDF page
        const receiptUrl = data.paymentReciept.url;
        const displayUrl =
          receiptUrl.length > 70 ? receiptUrl.slice(0, 70) + "..." : receiptUrl;

        extraPage.drawText(displayUrl, {
          x: margin + 110,
          y: extraY,
          font,
          size: 9,
          color: rgb(0.1, 0.4, 0.8),
        });
        extraY -= 24;
      }

      extraY -= 12; // Spacing before orders
    }

    // --- Order IDs ---
    if (hasOrders) {
      extraPage.drawRectangle({
        x: margin,
        y: extraY - 4,
        width: contentWidth,
        height: 20,
        color: GREEN_LIGHT,
      });
      extraPage.drawText(
        `INCLUDED ORDERS (${data.totalNumberofOrders || data.orderIds.length})`,
        {
          x: margin + 8,
          y: extraY + 3,
          font: boldFont,
          size: 8,
          color: GREEN_PRIMARY,
        },
      );
      extraY -= 18;

      const orderString = data.orderIds.join(", ");
      drawWrappedText(
        extraPage,
        orderString,
        margin,
        extraY,
        contentWidth,
        font,
        8,
        MUTED,
        60,
      );
    }

    drawFooter(extraPage);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
