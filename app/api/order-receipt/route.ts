import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GREEN_PRIMARY = rgb(0.27, 0.635, 0.357);
const GREEN_DARK = rgb(0.149, 0.282, 0.18);
const GREEN_LIGHT = rgb(0.925, 0.965, 0.933);
const GREEN_MUTED = rgb(0.431, 0.51, 0.447);
const GREEN_BORDER = rgb(0.863, 0.929, 0.875);
const WHITE = rgb(1, 1, 1);
const SUCCESS_GREEN = rgb(0.1, 0.72, 0.42);
const AMBER = rgb(0.96, 0.62, 0.04);
const RED = rgb(0.85, 0.2, 0.2);

interface OrderItem {
  productId?: {
    name?: string;
    category?: string;
    price?: number;
  };
  quantity?: number;
  markup?: number;
  total?: number;
  subsidy?: number;
}

interface OrderReceiptPayload {
  _id: string;
  products?: OrderItem[];
  subsidyItems?: OrderItem[];
  TotalGST?: number;
  TotalPST?: number;
  TotalDisposableFee?: number;
  cartTotal?: number;
  subsidy?: number;
  subsidyUsed?: number;
  status?: string;
  paymentMode?: string;
  createdAt: string;
  userId?: string;
  storeId?: string;
}

function fmtCurrency(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

function safeDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function safeTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid time";
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function safeFull(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid timestamp";
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function paymentLabel(mode?: string) {
  if (mode === "cash") return "Cash at Counter";
  if (mode === "card") return "Card at Counter";
  if (mode === "wallet") return "Wallet";
  if (mode === "pending") return "Pending";
  return mode || "Unknown";
}

function statusLabel(status?: string) {
  if (status === "completed") return "COMPLETED";
  if (status === "pending") return "PENDING";
  if (status === "cancelled") return "CANCELLED";
  return String(status || "UNKNOWN").toUpperCase();
}

function statusColor(status?: string) {
  if (status === "completed") return SUCCESS_GREEN;
  if (status === "pending") return AMBER;
  return RED;
}

export async function POST(req: Request) {
  try {
    const order = (await req.json()) as OrderReceiptPayload;

    if (!order?._id || !order?.createdAt) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 },
      );
    }

    const products = order.products ?? [];
    const subsidyItems = order.subsidyItems ?? [];
    const allProducts = [...products, ...subsidyItems];

    const totalGST = order.TotalGST ?? 0;
    const totalPST = order.TotalPST ?? 0;
    const totalFee = order.TotalDisposableFee ?? 0;
    const subsidyGenerated = order.subsidy ?? 0;
    const subsidyUsed = order.subsidyUsed ?? 0;
    const cartTotal = order.cartTotal ?? 0;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const margin = 40;
    const contentWidth = width - margin * 2;

    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: GREEN_PRIMARY,
    });

    page.drawRectangle({
      x: 0,
      y: height - 90,
      width: 5,
      height: 90,
      color: rgb(0.18, 0.5, 0.27),
    });

    page.drawText("Candian's Cart", {
      x: margin,
      y: height - 36,
      font: boldFont,
      size: 18,
      color: WHITE,
    });

    page.drawText("Order Invoice", {
      x: margin,
      y: height - 53,
      font,
      size: 9,
      color: rgb(0.82, 0.95, 0.86),
    });

    page.drawText(`Generated: ${safeFull(new Date().toISOString())}`, {
      x: margin,
      y: height - 68,
      font,
      size: 7.5,
      color: rgb(0.72, 0.9, 0.76),
    });

    const badgeW = 84;
    const badgeX = width - margin - badgeW;
    const sLabel = statusLabel(order.status);

    page.drawRectangle({
      x: badgeX,
      y: height - 54,
      width: badgeW,
      height: 20,
      color: statusColor(order.status),
    });

    const sLabelW = boldFont.widthOfTextAtSize(sLabel, 8);
    page.drawText(sLabel, {
      x: badgeX + (badgeW - sLabelW) / 2,
      y: height - 45,
      font: boldFont,
      size: 8,
      color: WHITE,
    });

    const summaryY = height - 150;
    page.drawRectangle({
      x: 0,
      y: summaryY,
      width,
      height: 55,
      color: GREEN_LIGHT,
    });

    page.drawRectangle({
      x: 0,
      y: summaryY,
      width: 5,
      height: 55,
      color: GREEN_PRIMARY,
    });

    const amtLabel = "TOTAL PAID";
    const amtLabelW = font.widthOfTextAtSize(amtLabel, 8);
    page.drawText(amtLabel, {
      x: (width - amtLabelW) / 2,
      y: summaryY + 40,
      font,
      size: 8,
      color: GREEN_MUTED,
    });

    const amtStr = fmtCurrency(cartTotal);
    const amtStrW = boldFont.widthOfTextAtSize(amtStr, 26);
    page.drawText(amtStr, {
      x: (width - amtStrW) / 2,
      y: summaryY + 10,
      font: boldFont,
      size: 26,
      color: GREEN_PRIMARY,
    });

    let y = height - 185;

    const drawSectionHeader = (title: string) => {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: contentWidth,
        height: 18,
        color: GREEN_LIGHT,
      });

      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: 3,
        height: 18,
        color: GREEN_PRIMARY,
      });

      page.drawText(title.toUpperCase(), {
        x: margin + 10,
        y: y + 3,
        font: boldFont,
        size: 7.5,
        color: GREEN_PRIMARY,
      });

      y -= 22;
    };

    const drawRow = (label: string, value: string, highlight = false) => {
      page.drawLine({
        start: { x: margin, y: y - 2 },
        end: { x: width - margin, y: y - 2 },
        thickness: 0.5,
        color: GREEN_BORDER,
      });

      page.drawText(label, {
        x: margin + 8,
        y,
        font,
        size: 9,
        color: GREEN_MUTED,
      });

      const valFont = highlight ? boldFont : font;
      const valColor = highlight ? GREEN_PRIMARY : GREEN_DARK;
      const valW = valFont.widthOfTextAtSize(value, 9);

      page.drawText(value, {
        x: width - margin - valW,
        y,
        font: valFont,
        size: 9,
        color: valColor,
      });

      y -= 18;
    };

    drawSectionHeader("Order Details");
    drawRow("Order ID", String(order._id));
    drawRow("Payment Method", paymentLabel(order.paymentMode));
    drawRow("Date", safeDate(order.createdAt));
    drawRow("Time", safeTime(order.createdAt));

    y -= 4;
    drawSectionHeader("Items");

    allProducts.forEach((item, index) => {
      const p = item.productId ?? {};
      const qty = item.quantity ?? 0;
      const subsidy = item.subsidy ?? 0;
      const unitBase =
        (p?.price ?? 0) + (p?.price ?? 0) * ((item.markup ?? 0) / 100);
      const total = unitBase * (item.quantity ?? 0);

      const itemName = p.name || `Item ${index + 1}`;
      const itemLine = `${itemName} × ${qty}`;
      drawRow(itemLine, fmtCurrency(total));

      if (subsidy > 0) {
        drawRow("Subsidy used", `-${fmtCurrency(subsidy)}`);
      }
    });

    y -= 4;
    drawSectionHeader("Amount Breakdown");

    drawRow("Subtotal", fmtCurrency(cartTotal - totalGST - totalPST - totalFee));
    if (totalGST > 0) drawRow("GST", fmtCurrency(totalGST));
    if (totalPST > 0) drawRow("PST", fmtCurrency(totalPST));
    if (totalFee > 0) drawRow("Disposable fee", fmtCurrency(totalFee));
    if (subsidyGenerated > 0) {
      drawRow("Subsidy generated", fmtCurrency(subsidyGenerated));
    }
    if (subsidyUsed > 0) {
      drawRow("Subsidy used", `-${fmtCurrency(subsidyUsed)}`);
    }
    drawRow("Total paid", fmtCurrency(cartTotal), true);

    y -= 4;
    drawSectionHeader("Reference");
    drawRow("Customer ID", String(order.userId ?? "N/A"));
    drawRow("Store ID", String(order.storeId ?? "N/A"));
    drawRow("Created", safeFull(order.createdAt));

    const footerH = 52;
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerH,
      color: GREEN_LIGHT,
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 3,
      color: GREEN_PRIMARY,
    });

    page.drawLine({
      start: { x: 0, y: footerH },
      end: { x: width, y: footerH },
      thickness: 0.5,
      color: GREEN_BORDER,
    });

    page.drawText(
      "This is an automatically generated invoice. Please retain it for your records.",
      {
        x: margin,
        y: footerH - 18,
        font,
        size: 8,
        color: GREEN_MUTED,
      },
    );

    const genText = `Generated on ${new Date().toLocaleDateString("en-CA")}`;
    const genTextW = font.widthOfTextAtSize(genText, 7.5);
    page.drawText(genText, {
      x: width - margin - genTextW,
      y: footerH - 18,
      font,
      size: 7.5,
      color: GREEN_PRIMARY,
    });

    page.drawText("Candian's Cart — Order history receipt", {
      x: margin,
      y: footerH - 34,
      font,
      size: 7.5,
      color: rgb(0.6, 0.72, 0.62),
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `invoice-${String(order._id).slice(-8).toUpperCase()}-${safeDate(order.createdAt).replace(/\s/g, "-")}.pdf`;

    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(pdfBuffer).set(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("order-receipt POST failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
