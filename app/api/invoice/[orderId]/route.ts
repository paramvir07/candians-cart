import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";

export const runtime = "nodejs";

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREEN_PRIMARY = rgb(0.24, 0.62, 0.21);
const GREEN_LIGHT = rgb(0.93, 0.98, 0.93);
const GREEN_DARK = rgb(0.12, 0.32, 0.16);
const GRAY_LINE = rgb(0.88, 0.92, 0.88);
const MUTED = rgb(0.48, 0.55, 0.5);
const WHITE = rgb(1, 1, 1);
const AMBER = rgb(0.85, 0.55, 0.1);
const AMBER_BG = rgb(1.0, 0.97, 0.88);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;
const truncate = (
  font: any,
  text: string,
  size: number,
  maxW: number,
): string => {
  let t = text;
  while (t.length > 4 && font.widthOfTextAtSize(t, size) > maxW)
    t = t.slice(0, -1);
  return t !== text ? t + "…" : t;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await dbConnect();
    const { orderId } = await params;

    const order = (await OrderModel.findById(orderId)
      .populate("products.productId")
      .lean()) as any;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    const margin = 44;
    const cw = width - margin * 2; // content width

    // ── Header banner ──────────────────────────────────────────────────────
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: GREEN_PRIMARY,
    });

    page.drawText("Canadian's Cart", {
      x: margin,
      y: height - 38,
      font: bold,
      size: 20,
      color: WHITE,
    });
    page.drawText("Your trusted Canadian grocery marketplace", {
      x: margin,
      y: height - 56,
      font,
      size: 9,
      color: rgb(0.78, 0.95, 0.78),
    });

    const invLabel = "INVOICE";
    const invW = bold.widthOfTextAtSize(invLabel, 24);
    page.drawText(invLabel, {
      x: width - margin - invW,
      y: height - 42,
      font: bold,
      size: 24,
      color: WHITE,
    });
    const orderRef = `#${order._id.toString().slice(-8).toUpperCase()}`;
    const refW = font.widthOfTextAtSize(orderRef, 10);
    page.drawText(orderRef, {
      x: width - margin - refW,
      y: height - 62,
      font,
      size: 10,
      color: rgb(0.78, 0.95, 0.78),
    });

    let y = height - 115;

    // ── Order meta row ─────────────────────────────────────────────────────
    const metaItems = [
      {
        label: "ORDER ID",
        value: order._id.toString().slice(-8).toUpperCase(),
      },
      {
        label: "DATE",
        value: new Date(order.createdAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      { label: "STATUS", value: order.status?.toUpperCase() ?? "COMPLETED" },
      {
        label: "PAYMENT",
        value: order.paymentMode
          ? order.paymentMode.charAt(0).toUpperCase() +
            order.paymentMode.slice(1)
          : "—",
      },
    ];

    const metaColW = cw / metaItems.length;
    metaItems.forEach((m, i) => {
      const x = margin + i * metaColW;
      page.drawText(m.label, { x, y, font, size: 8, color: MUTED });
      page.drawText(m.value, {
        x,
        y: y - 14,
        font: bold,
        size: 10,
        color: GREEN_DARK,
      });
    });

    y -= 38;
    page.drawRectangle({
      x: margin,
      y,
      width: cw,
      height: 1,
      color: GRAY_LINE,
    });
    y -= 18;

    // ── Products table header ──────────────────────────────────────────────
    page.drawRectangle({
      x: margin,
      y: y - 5,
      width: cw,
      height: 20,
      color: GREEN_LIGHT,
    });

    const col = {
      name: margin + 6,
      qty: margin + cw * 0.5,
      unit: margin + cw * 0.62,
      subsidy: margin + cw * 0.76,
      total: margin + cw * 0.89,
    };

    const hdrY = y + 1;
    page.drawText("ITEM", {
      x: col.name,
      y: hdrY,
      font: bold,
      size: 7.5,
      color: GREEN_PRIMARY,
    });
    page.drawText("QTY", {
      x: col.qty,
      y: hdrY,
      font: bold,
      size: 7.5,
      color: GREEN_PRIMARY,
    });
    page.drawText("UNIT PRICE", {
      x: col.unit,
      y: hdrY,
      font: bold,
      size: 7.5,
      color: GREEN_PRIMARY,
    });
    page.drawText("SUBSIDY", {
      x: col.subsidy,
      y: hdrY,
      font: bold,
      size: 7.5,
      color: GREEN_PRIMARY,
    });
    page.drawText("TOTAL", {
      x: col.total,
      y: hdrY,
      font: bold,
      size: 7.5,
      color: GREEN_PRIMARY,
    });

    y -= 22;

    // ── Product rows ───────────────────────────────────────────────────────
    let hasAnySubsidy = false;
    for (let i = 0; i < order.products.length; i++) {
      const item = order.products[i] as any;
      const prod = item.productId as any;

      // Alternate row bg
      if (i % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - 5,
          width: cw,
          height: 20,
          color: rgb(0.985, 1, 0.985),
        });
      }

      const name = truncate(
        font,
        prod?.name ?? "Unknown Product",
        10,
        cw * 0.47,
      );
      const qty = item.quantity.toString();
      const unitCents = (prod?.price ?? 0) + (item.markup ?? 0);
      const subsidyCents = item.subsidy ?? 0;
      if (subsidyCents > 0) hasAnySubsidy = true;

      page.drawText(name, {
        x: col.name,
        y,
        font,
        size: 10,
        color: GREEN_DARK,
      });
      page.drawText(qty, { x: col.qty, y, font, size: 10, color: GREEN_DARK });
      page.drawText(fmt(unitCents), {
        x: col.unit,
        y,
        font,
        size: 10,
        color: GREEN_DARK,
      });

      if (subsidyCents > 0) {
        page.drawText(`-${fmt(subsidyCents)}`, {
          x: col.subsidy,
          y,
          font,
          size: 10,
          color: AMBER,
        });
      } else {
        page.drawText("—", { x: col.subsidy, y, font, size: 10, color: MUTED });
      }

      page.drawText(fmt(item.total ?? 0), {
        x: col.total,
        y,
        font: bold,
        size: 10,
        color: GREEN_DARK,
      });

      y -= 22;
    }

    // ── Divider ────────────────────────────────────────────────────────────
    y -= 4;
    page.drawRectangle({
      x: margin,
      y,
      width: cw,
      height: 1,
      color: GRAY_LINE,
    });
    y -= 20;

    // ── Totals block ───────────────────────────────────────────────────────
    const totLabelX = width - margin - 200;
    const totValueX = width - margin - 70;

    const drawTotRow = (
      label: string,
      value: string,
      yPos: number,
      labelColor = MUTED,
      valueColor = GREEN_DARK,
      valueFont = font,
    ) => {
      page.drawText(label, {
        x: totLabelX,
        y: yPos,
        font,
        size: 10,
        color: labelColor,
      });
      const vw = valueFont.widthOfTextAtSize(value, 10);
      page.drawText(value, {
        x: width - margin - vw,
        y: yPos,
        font: valueFont,
        size: 10,
        color: valueColor,
      });
    };

    drawTotRow("Base Total", fmt(order.BaseTotal ?? 0), y);
    y -= 18;
    drawTotRow("GST (5%)", fmt(order.TotalGST ?? 0), y);
    y -= 18;
    drawTotRow("PST", fmt(order.TotalPST ?? 0), y);
    y -= 18;

    if ((order.TotalDisposableFee ?? 0) > 0) {
      drawTotRow("Disposable Fee", fmt(order.TotalDisposableFee), y);
      y -= 18;
    }

    if ((order.susbsidyUsed ?? 0) > 0) {
      // Subsidy banner
      page.drawRectangle({
        x: totLabelX - 8,
        y: y - 6,
        width: 200 + 8 + margin - 16,
        height: 22,
        color: AMBER_BG,
      });
      drawTotRow(
        "Subsidy Applied",
        `-${fmt(order.susbsidyUsed)}`,
        y,
        AMBER,
        AMBER,
        bold,
      );
      y -= 26;
    }

    // Total divider
    page.drawRectangle({
      x: totLabelX - 8,
      y,
      width: 200 + 8 + margin - 16,
      height: 1,
      color: GRAY_LINE,
    });
    y -= 22;

    // Grand total banner
    page.drawRectangle({
      x: totLabelX - 12,
      y: y - 8,
      width: width - margin - totLabelX + 12,
      height: 30,
      color: GREEN_PRIMARY,
    });
    page.drawText("TOTAL", {
      x: totLabelX,
      y: y + 2,
      font: bold,
      size: 11,
      color: WHITE,
    });
    const totalStr = fmt(order.cartTotal);
    const totalW = bold.widthOfTextAtSize(totalStr, 13);
    page.drawText(totalStr, {
      x: width - margin - totalW,
      y: y + 2,
      font: bold,
      size: 13,
      color: WHITE,
    });
    y -= 40;

    // ── Subsidy note (if any) ───────────────────────────────────────────────
    if (hasAnySubsidy || (order.susbsidyUsed ?? 0) > 0) {
      page.drawRectangle({
        x: margin,
        y: y - 8,
        width: cw,
        height: 28,
        color: AMBER_BG,
      });
      page.drawRectangle({
        x: margin,
        y: y - 8,
        width: 3,
        height: 28,
        color: AMBER,
      });
      page.drawText("Subsidised Order", {
        x: margin + 10,
        y: y + 6,
        font: bold,
        size: 9,
        color: AMBER,
      });
      page.drawText(
        `CA$${((order.susbsidyUsed ?? 0) / 100).toFixed(2)} subsidy was applied to this order by your store.`,
        { x: margin + 10, y: y - 5, font, size: 8, color: rgb(0.6, 0.45, 0.1) },
      );
      y -= 38;
    }

    // ── Footer ─────────────────────────────────────────────────────────────
    const footerH = 48;
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerH,
      color: GREEN_LIGHT,
    });
    page.drawRectangle({
      x: 0,
      y: footerH,
      width,
      height: 1,
      color: GRAY_LINE,
    });

    page.drawText("Thank you for shopping with Canadian's Cart!", {
      x: margin,
      y: footerH - 18,
      font,
      size: 9,
      color: MUTED,
    });
    const supportText = "support@canadianscart.ca";
    const supportW = font.widthOfTextAtSize(supportText, 9);
    page.drawText(supportText, {
      x: width - margin - supportW,
      y: footerH - 18,
      font,
      size: 9,
      color: GREEN_PRIMARY,
    });
    page.drawText(
      `Invoice generated ${new Date().toLocaleDateString("en-CA")}`,
      {
        x: margin,
        y: footerH - 32,
        font,
        size: 8,
        color: rgb(0.7, 0.76, 0.7),
      },
    );

    // ── Serialize — correct approach for Vercel ────────────────────────────
    // pdfDoc.save() returns Uint8Array.
    // We must NOT use Buffer.from(pdfBytes) with spread — it can truncate.
    // Use Buffer.from(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength).
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(
      pdfBytes.buffer,
      pdfBytes.byteOffset,
      pdfBytes.byteLength,
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`,
        "Content-Length": buffer.byteLength.toString(),
        // Prevent any middleware from buffering/transforming the response
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[invoice] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to generate invoice" },
      { status: 500 },
    );
  }
}
