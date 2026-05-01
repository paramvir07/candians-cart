import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ─── Brand colors (from globals.css light mode oklch values → RGB approximation)
// --primary: oklch(0.6271 0.1699 149.2138) ≈ rgb(70, 162, 91)  — main green
// --secondary: oklch(0.9669 0.0287 158.06) ≈ rgb(236, 246, 238) — light green tint
// --foreground: oklch(0.2661 0.0625 153.04) ≈ rgb(38, 72, 46)   — dark green text
// --muted-foreground: oklch(0.5252 0.0315)  ≈ rgb(110, 130, 114) — muted

const GREEN_PRIMARY = rgb(0.27, 0.635, 0.357); // #46A25B  — header / accents
const GREEN_DARK = rgb(0.149, 0.282, 0.18); // #264824  — body text
const GREEN_LIGHT = rgb(0.925, 0.965, 0.933); // #ECFAEE  — section bg / summary bg
const GREEN_MUTED = rgb(0.431, 0.51, 0.447); // #6E8272  — muted labels
const GREEN_BORDER = rgb(0.863, 0.929, 0.875); // #DCEDDF  — divider lines
const WHITE = rgb(1, 1, 1);
const SUCCESS_GREEN = rgb(0.1, 0.72, 0.42);
const AMBER = rgb(0.96, 0.62, 0.04);
const RED = rgb(0.85, 0.2, 0.2);
const GIFT_AMBER = rgb(0.96, 0.62, 0.04);

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

    const isGift = t.paymentMode === "gift";
    const isSuccess = t.status === "paid" || t.status === "completed";
    const statusColor = isSuccess
      ? SUCCESS_GREEN
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
          : t.paymentMode === "card"
            ? "Card at Counter"
            : t.paymentMode === "gift"
              ? "Special Bonus Added"
              : "Unknown";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    const margin = 48;
    const contentWidth = width - margin * 2;

    // ── Header bar (green) ──────────────────────────────────────────────────
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: GREEN_PRIMARY,
    });

    // Left accent strip (slightly darker)
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
    page.drawText("Wallet Receipt", {
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

    // Status badge
    const badgeW = 70;
    const badgeX = width - margin - badgeW;
    page.drawRectangle({
      x: badgeX,
      y: height - 54,
      width: badgeW,
      height: 20,
      color: statusColor,
    });
    const lblW = boldFont.widthOfTextAtSize(statusLabel, 8);
    page.drawText(statusLabel, {
      x: badgeX + (badgeW - lblW) / 2,
      y: height - 45,
      font: boldFont,
      size: 8,
      color: WHITE,
    });

    // Gift badge (if applicable)
    if (isGift) {
      page.drawRectangle({
        x: badgeX,
        y: height - 78,
        width: badgeW,
        height: 18,
        color: GIFT_AMBER,
      });
      const giftLbl = "GIFT";
      const giftLblW = boldFont.widthOfTextAtSize(giftLbl, 8);
      page.drawText(giftLbl, {
        x: badgeX + (badgeW - giftLblW) / 2,
        y: height - 70,
        font: boldFont,
        size: 8,
        color: WHITE,
      });
    }

    // ── Amount summary box ──────────────────────────────────────────────────
    const summaryY = height - 150;
    page.drawRectangle({
      x: 0,
      y: summaryY,
      width,
      height: 55,
      color: GREEN_LIGHT,
    });

    // Left green stripe on summary too
    page.drawRectangle({
      x: 0,
      y: summaryY,
      width: 5,
      height: 55,
      color: GREEN_PRIMARY,
    });

    const amtLabel = isGift ? "GIFT AMOUNT RECEIVED" : "AMOUNT TOPPED UP";
    const amtLabelSize = 8;
    const amtLabelW = font.widthOfTextAtSize(amtLabel, amtLabelSize);
    page.drawText(amtLabel, {
      x: (width - amtLabelW) / 2,
      y: summaryY + 40,
      font,
      size: amtLabelSize,
      color: GREEN_MUTED,
    });

    const amtStr = fmtCurrency(t.amount, t.currency);
    const amtStrSize = 26;
    const amtStrW = boldFont.widthOfTextAtSize(amtStr, amtStrSize);
    page.drawText(amtStr, {
      x: (width - amtStrW) / 2,
      y: summaryY + 10,
      font: boldFont,
      size: amtStrSize,
      color: GREEN_PRIMARY,
    });

    // ── Section helper ──────────────────────────────────────────────────────
    let y = height - 175;

    const drawSectionHeader = (title: string) => {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: contentWidth,
        height: 18,
        color: GREEN_LIGHT,
      });
      // Green left nub on section headers
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
      const valColor = highlight ? GREEN_PRIMARY : GREEN_DARK;
      const valFont = highlight ? boldFont : font;
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

    drawSectionHeader("Transaction Details");
    drawRow("Transaction ID", String(t.id));
    drawRow("Type", String(t.label ?? "N/A"));
    drawRow("Payment Method", methodLabel);
    if (!isGift) drawRow("Description", String(t.sublabel ?? "N/A"));

    y -= 4;
    drawSectionHeader("Amount Breakdown");
    drawRow(
      isGift ? "Gift Amount" : "Top-Up Amount",
      fmtCurrency(t.amount, t.currency),
      true,
    );
    drawRow("Currency", String(t.currency).toUpperCase());

    y -= 4;
    drawSectionHeader("Date & Time");
    drawRow("Date", safeDate(t.createdAt));
    drawRow("Time", safeTime(t.createdAt));
    drawRow("Full Timestamp", safeFull(t.createdAt));

    y -= 4;
    drawSectionHeader("Reference");
    drawRow("Reference ID", String(t.referenceId ?? "N/A"));
    drawRow(
      "Source",
      t.type === "stripe"
        ? "Stripe Payment Gateway"
        : isGift
          ? "Gift"
          : "In-Store Cashier",
    );

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerH = 52;
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerH,
      color: GREEN_LIGHT,
    });
    page.drawRectangle({ x: 0, y: 0, width, height: 3, color: GREEN_PRIMARY });
    page.drawLine({
      start: { x: 0, y: footerH },
      end: { x: width, y: footerH },
      thickness: 0.5,
      color: GREEN_BORDER,
    });

    page.drawText(
      "This is an automatically generated receipt. Please retain for your records.",
      { x: margin, y: footerH - 18, font, size: 8, color: GREEN_MUTED },
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
    page.drawText(
      "Candian's Cart — Your wallet activity is encrypted and securely stored.",
      {
        x: margin,
        y: footerH - 34,
        font,
        size: 7.5,
        color: rgb(0.6, 0.72, 0.62),
      },
    );

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
