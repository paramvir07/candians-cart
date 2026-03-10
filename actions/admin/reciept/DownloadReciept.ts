"use server";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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
const BLUE_ACCENT = rgb(0.14, 0.38, 0.92); // Kept for platform profit contrast

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
  page.drawText("CandianCart", {
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
    highlightColor?: any,
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
  drawLabel("STORE ID", String(data._id), y);

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
  drawLabelRight("STATUS", "Completed", y);

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
  page.drawText("FINANCIAL BREAKDOWN", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  let rowIndex = 0;
  const breakdownItems = [
    {
      label: "Total Customer Paid",
      value: formatMoney(data.totalCustomerPaid),
      bold: true,
    },
    { label: "Total Base Price", value: formatMoney(data.totalBasePrice) },
    { label: "Total GST", value: formatMoney(data.totalGST) },
    { label: "Total PST", value: formatMoney(data.totalPST) },
    { label: "Total Tax (GST + PST)", value: formatMoney(data.totalTax) },
    {
      label: "Total Disposable Fee",
      value: formatMoney(data.totalDisposableFee),
    },
  ];

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
    drawRow(item.label, item.value, y, item.bold);
    y -= 24;
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
  y -= 24;

  // --- Section 2: Margin & Profit ---
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 22,
    color: GREEN_LIGHT,
  });
  page.drawText("MARGIN & PROFIT", {
    x: margin + 8,
    y: y + 4,
    font: boldFont,
    size: 8,
    color: GREEN_PRIMARY,
  });
  y -= 20;

  rowIndex = 0;
  const marginItems = [
    {
      label: "Store Fixed Value (SFV)",
      value: formatMoney(data.storeFixedValue),
    },
    {
      label: "Gross Margin (CP - SFV)",
      value: formatMoney(data.grossMargin),
      bold: true,
    },
    {
      label: "Store Profit (30% Margin)",
      value: formatMoney(data.storeProfit),
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
    drawRow(item.label, item.value, y, item.bold);
    y -= 24;
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
  const storePayoutStr = formatMoney(data.storePayout);
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
  const platformProfitStr = formatMoney(data.platformProfit);
  const platformProfitStrW = boldFont.widthOfTextAtSize(platformProfitStr, 13);
  page.drawText(platformProfitStr, {
    x: width - margin - platformProfitStrW,
    y: y + 2,
    font: boldFont,
    size: 13,
    color: WHITE,
  });

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

  page.drawText("Thank you for partnering with CandianCart!", {
    x: margin,
    y: footerY - 18,
    font,
    size: 9,
    color: MUTED,
  });

  const supportText = "support@candiancart.ca";
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
    storeId,
  });

  const data = Array.isArray(receipts) ? receipts[0] : receipts;

  if (!data) {
    throw new Error("No receipt data found");
  }

  // Pass dates down to display nicely in the PDF
  const pdfBytes = await generateReceiptPDF(data, startDateIso, endDateIso);

  return Buffer.from(pdfBytes).toString("base64");
}
