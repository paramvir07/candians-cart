import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BLUE_PRIMARY = rgb(0.23, 0.51, 0.96);
const BLUE_LIGHT = rgb(0.94, 0.96, 1.0);
const BLUE_DARK = rgb(0.06, 0.09, 0.16);
const GRAY_LINE = rgb(0.88, 0.91, 0.95);
const MUTED = rgb(0.39, 0.45, 0.55);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.06, 0.73, 0.51);
const AMBER = rgb(0.96, 0.62, 0.04);
const RED = rgb(0.94, 0.27, 0.27);

interface ReceiptPayload {
  id: string;
  type: "stripe" | "cashier";
  amount: number;
  currency: string;
  status: string;
  paymentMode?: string;
  createdAt: string;
  label: string;
  sublabel: string;
  referenceId: string;
}

function fmtCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
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

export async function POST(req: Request) {
  try {
    const t = (await req.json()) as ReceiptPayload;

    if (
      !t?.id ||
      !t?.createdAt ||
      !t?.currency ||
      typeof t.amount !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required transaction fields" },
        { status: 400 },
      );
    }

    const isSuccess = t.status === "paid" || t.status === "completed";
    const statusColor = isSuccess
      ? GREEN
      : t.status === "pending"
        ? AMBER
        : RED;
    const statusLabel = isSuccess
      ? "COMPLETED"
      : String(t.status || "UNKNOWN").toUpperCase();

    const methodLabel =
      t.paymentMode === "online"
        ? "Online via Stripe"
        : t.paymentMode === "cash"
          ? "Cash at Counter"
          : "Card at Counter";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const margin = 48;
    const contentWidth = width - margin * 2;

    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: BLUE_PRIMARY,
    });

    page.drawText("Wallet Receipt", {
      x: margin,
      y: height - 40,
      font: boldFont,
      size: 22,
      color: WHITE,
    });

    page.drawText("Top-Up Confirmation", {
      x: margin,
      y: height - 58,
      font,
      size: 9,
      color: rgb(0.8, 0.88, 1),
    });

    page.drawText(`Generated: ${safeFull(new Date().toISOString())}`, {
      x: margin,
      y: height - 72,
      font,
      size: 8,
      color: rgb(0.7, 0.8, 1),
    });

    const badgeW = 62;
    const badgeX = width - margin - badgeW;

    page.drawRectangle({
      x: badgeX,
      y: height - 52,
      width: badgeW,
      height: 18,
      color: statusColor,
    });

    const lblW = boldFont.widthOfTextAtSize(statusLabel, 8);
    page.drawText(statusLabel, {
      x: badgeX + (badgeW - lblW) / 2,
      y: height - 44,
      font: boldFont,
      size: 8,
      color: WHITE,
    });

    const summaryBoxY = height - 140;
    const summaryBoxH = 50;
    const summaryPaddingTop = 4; // adjust this
    const summaryGap = 3; // space between label and amount

    page.drawRectangle({
      x: 0,
      y: summaryBoxY,
      width,
      height: summaryBoxH,
      color: BLUE_LIGHT,
    });

    const amtLabel = "AMOUNT TOPPED UP";
    const amtLabelSize = 8;
    const amtLabelW = font.widthOfTextAtSize(amtLabel, amtLabelSize);
    const amtLabelY =
      summaryBoxY + summaryBoxH - summaryPaddingTop - amtLabelSize;

    page.drawText(amtLabel, {
      x: (width - amtLabelW) / 2,
      y: amtLabelY,
      font,
      size: amtLabelSize,
      color: MUTED,
    });

    const amtStr = fmtCurrency(t.amount, t.currency);
    const amtStrSize = 26;
    const amtStrW = boldFont.widthOfTextAtSize(amtStr, amtStrSize);
    const amtStrY = amtLabelY - summaryGap - amtStrSize;

    page.drawText(amtStr, {
      x: (width - amtStrW) / 2,
      y: amtStrY,
      font: boldFont,
      size: amtStrSize,
      color: BLUE_DARK,
    });

    let y = height - 162;

    const drawSectionHeader = (title: string) => {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: contentWidth,
        height: 16,
        color: BLUE_LIGHT,
      });

      page.drawText(title.toUpperCase(), {
        x: margin + 8,
        y: y + 2,
        font: boldFont,
        size: 7.5,
        color: BLUE_PRIMARY,
      });

      y -= 18;
    };

    const drawRow = (label: string, value: string, highlight = false) => {
      page.drawLine({
        start: { x: margin, y: y - 2 },
        end: { x: width - margin, y: y - 2 },
        thickness: 0.5,
        color: GRAY_LINE,
      });

      page.drawText(label, {
        x: margin + 8,
        y,
        font,
        size: 9,
        color: MUTED,
      });

      const valColor = highlight ? GREEN : BLUE_DARK;
      const valFont = highlight ? boldFont : font;
      const valW = valFont.widthOfTextAtSize(value, 9);

      page.drawText(value, {
        x: width - margin - valW,
        y,
        font: valFont,
        size: 9,
        color: valColor,
      });

      y -= 16;
    };

    drawSectionHeader("Transaction Details");
    drawRow("Transaction ID", String(t.id));
    drawRow("Type", String(t.label ?? "N/A"));
    drawRow("Payment Method", methodLabel);
    drawRow("Description", String(t.sublabel ?? "N/A"));

    y -= 6;
    drawSectionHeader("Amount Breakdown");
    drawRow("Top-Up Amount", fmtCurrency(t.amount, t.currency), true);
    drawRow("Currency", String(t.currency).toUpperCase());

    y -= 6;
    drawSectionHeader("Date & Time");
    drawRow("Date", safeDate(t.createdAt));
    drawRow("Time", safeTime(t.createdAt));
    drawRow("Full Timestamp", safeFull(t.createdAt));

    y -= 6;
    drawSectionHeader("Reference");
    drawRow("Reference ID", String(t.referenceId ?? "N/A"));
    drawRow(
      "Source",
      t.type === "stripe" ? "Stripe Payment Gateway" : "In-Store Cashier",
    );

    const footerH = 48;
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerH,
      color: BLUE_LIGHT,
    });
    page.drawLine({
      start: { x: 0, y: footerH },
      end: { x: width, y: footerH },
      thickness: 0.5,
      color: GRAY_LINE,
    });

    page.drawText(
      "This is an automatically generated receipt. Please retain for your records.",
      {
        x: margin,
        y: footerH - 18,
        font,
        size: 8,
        color: MUTED,
      },
    );

    const genText = `Invoice generated on ${new Date().toLocaleDateString("en-CA")}`;
    const genTextW = font.widthOfTextAtSize(genText, 7.5);
    page.drawText(genText, {
      x: width - margin - genTextW,
      y: footerH - 18,
      font,
      size: 7.5,
      color: BLUE_PRIMARY,
    });

    page.drawText("Your wallet activity is encrypted and securely stored.", {
      x: margin,
      y: footerH - 32,
      font,
      size: 7.5,
      color: rgb(0.65, 0.7, 0.78),
    });

    const pdfBytes = await pdfDoc.save();

    const filename = `receipt-${String(t.id).slice(-8).toUpperCase()}-${safeDate(t.createdAt).replace(/\s/g, "-")}.pdf`;

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
    console.error("wallet-receipt POST failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
