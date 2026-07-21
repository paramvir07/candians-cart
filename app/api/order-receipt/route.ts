import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 34;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_SAFE_AREA = 42;

const GREEN_PRIMARY = rgb(0.06, 0.63, 0.31);
const GREEN_DARK = rgb(0.04, 0.23, 0.12);
const GREEN_MUTED = rgb(0.38, 0.48, 0.42);
const GREEN_LIGHT = rgb(0.965, 0.985, 0.97);
const GREEN_BORDER = rgb(0.82, 0.91, 0.85);
const AMBER = rgb(0.96, 0.56, 0.02);
const WHITE = rgb(1, 1, 1);

interface ProductImage {
  url?: string;
}

interface ReceiptItem {
  productId?: {
    _id?: string | { toString(): string };
    name?: string;
    category?: string;
    price?: number;
    images?: Array<ProductImage | string>;
    subsidised?: boolean;
    UOM?: string;
    isMeasuredInWeight?: boolean;
  };
  productName?: string;
  quantity?: number;
  markup?: number;
  total?: number;
  price?: number;
  tax?: number;
  subsidy?: number;
  __type?: "normal" | "subsidy" | "misc";
}

interface OrderReceiptPayload {
  _id: string;
  products?: ReceiptItem[];
  subsidyItems?: ReceiptItem[];
  miscItems?: ReceiptItem[];
  TotalGST?: number;
  TotalPST?: number;
  TotalDisposableFee?: number;
  cartTotal?: number;
  subsidy?: number;
  subsidyUsed?: number;
  createdAt: string;
}

function fmtCurrency(cents: number) {
  return `CA$${((cents ?? 0) / 100).toFixed(2)}`;
}

function fmtBefore(cents: number) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function formatQuantity(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.?0+$/, "");
}

function safeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/Vancouver",
  }).format(date);
}

function safeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid time";

  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Vancouver",
  }).format(date);
}

function trimText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;

  let result = text;
  while (
    result.length > 1 &&
    font.widthOfTextAtSize(`${result}...`, size) > maxWidth
  ) {
    result = result.slice(0, -1);
  }

  return `${result}...`;
}

async function loadLogo(pdfDoc: PDFDocument): Promise<PDFImage | undefined> {
  try {
    const logoPath = path.join(process.cwd(), "app", "icon.jpg");
    const logoBytes = await readFile(logoPath);
    return await pdfDoc.embedJpg(logoBytes);
  } catch (error) {
    console.warn("Could not load app/icon.jpg for the receipt:", error);
    return undefined;
  }
}

function getProductImageUrl(product?: ReceiptItem["productId"]) {
  const firstImage = product?.images?.[0];

  if (typeof firstImage === "string") return firstImage;
  return firstImage?.url;
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isJpeg(bytes: Uint8Array) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

async function loadProductImage(
  pdfDoc: PDFDocument,
  imageUrl: string | undefined,
  requestUrl: string,
  requestCookie: string | null,
): Promise<PDFImage | undefined> {
  if (!imageUrl) return undefined;

  try {
    const resolvedUrl = new URL(imageUrl, requestUrl);
    const requestOrigin = new URL(requestUrl).origin;
    const headers: Record<string, string> = {
      Accept: "image/png,image/jpeg;q=0.9,*/*;q=0.5",
    };

    // Forward cookies only for images hosted by this same Next.js app.
    if (requestCookie && resolvedUrl.origin === requestOrigin) {
      headers.Cookie = requestCookie;
    }

    const response = await fetch(resolvedUrl, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      console.warn(
        `Product image request failed (${response.status}): ${resolvedUrl}`,
      );
      return undefined;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (isPng(bytes)) return await pdfDoc.embedPng(bytes);
    if (isJpeg(bytes)) return await pdfDoc.embedJpg(bytes);

    console.warn(`Unsupported product image format for PDF: ${resolvedUrl}`);
    return undefined;
  } catch (error) {
    console.warn(`Could not load product image: ${imageUrl}`, error);
    return undefined;
  }
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

    const normalProducts = (order.products ?? []).filter(
      (item) => item.productId != null,
    );
    const subsidyProducts = (order.subsidyItems ?? []).filter(
      (item) => item.productId != null,
    );
    const miscProducts = order.miscItems ?? [];

    const rawItems: ReceiptItem[] = [
      ...normalProducts.map((item) => ({
        ...item,
        __type: "normal" as const,
      })),
      ...subsidyProducts.map((item) => ({
        ...item,
        __type: "subsidy" as const,
      })),
      ...miscProducts.map((item) => ({
        ...item,
        __type: "misc" as const,
      })),
    ];

    const PINNED_LAST_IDS = [
      "6a2f51207f6cc4d79650b794",
      "6a2f51897f6cc4d79650b796",
    ];

    const isPinned = (item: ReceiptItem) =>
      PINNED_LAST_IDS.includes(item.productId?._id?.toString() ?? "");

    const nonSubsidisedAll = rawItems
      .filter((item) => !item.productId?.subsidised)
      .reverse();

    const nonSubsidisedPinned = nonSubsidisedAll.filter(isPinned);
    const nonSubsidisedRest = nonSubsidisedAll.filter(
      (item) => !isPinned(item),
    );

    const subsidised = rawItems
      .filter((item) => item.productId?.subsidised)
      .reverse();

    const allProducts = [
      ...nonSubsidisedRest,
      ...subsidised,
      ...nonSubsidisedPinned,
    ];

    const totalGST = order.TotalGST ?? 0;
    const totalPST = order.TotalPST ?? 0;
    const totalFee = order.TotalDisposableFee ?? 0;
    const subsidyGenerated = order.subsidy ?? 0;
    const subsidyUsed = order.subsidyUsed ?? 0;
    const cartTotal = order.cartTotal ?? 0;
    const platformFee = 50;

    const priceBeforeSavings = cartTotal + subsidyUsed;
    const usedFromOldWallet = Math.max(0, subsidyUsed - subsidyGenerated);
    const savedToWallet = Math.max(0, subsidyGenerated - subsidyUsed);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logo = await loadLogo(pdfDoc);

    let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - 36;

    const addPage = () => {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 42;

      page.drawText("Order Details", {
        x: MARGIN,
        y,
        font: boldFont,
        size: 12,
        color: GREEN_DARK,
      });

      const continued = "(continued)";
      page.drawText(continued, {
        x: MARGIN + boldFont.widthOfTextAtSize("Order Details", 12) + 6,
        y: y + 1,
        font,
        size: 8,
        color: GREEN_MUTED,
      });

      y -= 24;
    };

    const ensureSpace = (needed: number) => {
      if (y - needed < BOTTOM_SAFE_AREA) addPage();
    };

    const drawStrikeText = (
      text: string,
      x: number,
      baselineY: number,
      size: number,
      textFont: PDFFont = font,
    ) => {
      page.drawText(text, {
        x,
        y: baselineY,
        font: textFont,
        size,
        color: GREEN_MUTED,
      });

      const textWidth = textFont.widthOfTextAtSize(text, size);
      page.drawLine({
        start: { x, y: baselineY + size * 0.42 },
        end: { x: x + textWidth, y: baselineY + size * 0.42 },
        thickness: 0.55,
        color: GREEN_MUTED,
        opacity: 0.7,
      });
    };

    const drawSparkleIcon = (
      centerX: number,
      centerY: number,
      size: number,
      color = AMBER,
    ) => {
      const sparklePath =
        "M 0 1 L 0.28 0.28 L 1 0 L 0.28 -0.28 L 0 -1 L -0.28 -0.28 L -1 0 L -0.28 0.28 Z";

      page.drawSvgPath(sparklePath, {
        x: centerX,
        y: centerY,
        scale: size,
        color,
      });

      page.drawSvgPath(sparklePath, {
        x: centerX + size * 1.15,
        y: centerY + size * 0.8,
        scale: size * 0.34,
        color,
      });

      page.drawSvgPath(sparklePath, {
        x: centerX - size * 0.9,
        y: centerY - size * 0.85,
        scale: size * 0.25,
        color,
      });
    };

    const drawCalendarIcon = (
      x: number,
      baselineY: number,
      color = GREEN_MUTED,
    ) => {
      page.drawRectangle({
        x,
        y: baselineY - 1,
        width: 8,
        height: 7,
        borderColor: color,
        borderWidth: 0.75,
      });
      page.drawLine({
        start: { x: x + 2, y: baselineY + 7 },
        end: { x: x + 2, y: baselineY + 5 },
        thickness: 0.8,
        color,
      });
      page.drawLine({
        start: { x: x + 6, y: baselineY + 7 },
        end: { x: x + 6, y: baselineY + 5 },
        thickness: 0.8,
        color,
      });
      page.drawLine({
        start: { x, y: baselineY + 3.5 },
        end: { x: x + 8, y: baselineY + 3.5 },
        thickness: 0.55,
        color,
      });
    };

    const drawClockIcon = (
      centerX: number,
      centerY: number,
      color = GREEN_MUTED,
    ) => {
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: 4,
        borderColor: color,
        borderWidth: 0.75,
      });
      page.drawLine({
        start: { x: centerX, y: centerY },
        end: { x: centerX, y: centerY + 2.3 },
        thickness: 0.7,
        color,
      });
      page.drawLine({
        start: { x: centerX, y: centerY },
        end: { x: centerX + 1.8, y: centerY - 1.1 },
        thickness: 0.7,
        color,
      });
    };

    const drawBadge = ({
      text,
      x,
      y,
      fill,
      textColor,
      borderColor,
      sparkle = false,
    }: {
      text: string;
      x: number;
      y: number;
      fill: ReturnType<typeof rgb>;
      textColor: ReturnType<typeof rgb>;
      borderColor?: ReturnType<typeof rgb>;
      sparkle?: boolean;
    }) => {
      const fontSize = 6.2;
      const iconSpace = sparkle ? 9 : 0;
      const horizontalPadding = 5;
      const textWidth = boldFont.widthOfTextAtSize(text, fontSize);
      const width = textWidth + iconSpace + horizontalPadding * 2;
      const height = 13;

      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: fill,
        borderColor: borderColor ?? fill,
        borderWidth: borderColor ? 0.6 : 0,
      });

      if (sparkle) {
        drawSparkleIcon(x + 6.5, y + 6.5, 2.4, textColor);
      }

      page.drawText(text, {
        x: x + horizontalPadding + iconSpace,
        y: y + 3.4,
        font: boldFont,
        size: fontSize,
        color: textColor,
      });

      return width;
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(22);

      page.drawText(title.toUpperCase(), {
        x: MARGIN,
        y,
        font: boldFont,
        size: 8,
        color: GREEN_MUTED,
      });

      y -= 15;
    };

    const drawDivider = (
      left = MARGIN + 12,
      right = PAGE_WIDTH - MARGIN - 12,
    ) => {
      page.drawLine({
        start: { x: left, y },
        end: { x: right, y },
        thickness: 0.55,
        color: GREEN_BORDER,
      });
      y -= 12;
    };

    const drawSummaryRow = (
      label: string,
      value: string,
      options?: {
        strong?: boolean;
        amber?: boolean;
        strike?: boolean;
        xInset?: number;
      },
    ) => {
      const strong = options?.strong ?? false;
      const xInset = options?.xInset ?? 14;
      const valueFont = strong ? boldFont : font;
      const size = strong ? 10.5 : 9;

      page.drawText(label, {
        x: MARGIN + xInset,
        y,
        font: strong ? boldFont : font,
        size,
        color: strong ? GREEN_DARK : GREEN_MUTED,
      });

      const valueWidth = valueFont.widthOfTextAtSize(value, size);
      const valueX = PAGE_WIDTH - MARGIN - xInset - valueWidth;

      if (options?.strike) {
        drawStrikeText(value, valueX, y, size, valueFont);
      } else {
        page.drawText(value, {
          x: valueX,
          y,
          font: valueFont,
          size,
          color: options?.amber ? AMBER : strong ? GREEN_PRIMARY : GREEN_DARK,
        });
      }

      y -= strong ? 19 : 17;
    };

    // Header - compact and visually aligned with the app dialog.
    const headerHeight = 82;
    const headerBottom = PAGE_HEIGHT - 30 - headerHeight;

    page.drawRectangle({
      x: MARGIN,
      y: headerBottom,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: WHITE,
      borderColor: GREEN_BORDER,
      borderWidth: 0.8,
    });

    if (logo) {
      const scaled = logo.scaleToFit(44, 44);
      page.drawImage(logo, {
        x: MARGIN + 15,
        y: headerBottom + (headerHeight - scaled.height) / 2,
        width: scaled.width,
        height: scaled.height,
      });
    }

    const titleX = MARGIN + (logo ? 70 : 18);

    page.drawText("Order Details", {
      x: titleX,
      y: headerBottom + 55,
      font: boldFont,
      size: 14,
      color: GREEN_DARK,
    });

    if (subsidyUsed > 0) {
      page.drawCircle({
        x: titleX + 100,
        y: headerBottom + 59,
        size: 7,
        color: rgb(1, 0.97, 0.88),
      });
      drawSparkleIcon(titleX + 100, headerBottom + 59, 4.1, AMBER);
    }

    page.drawText(`#${String(order._id)}`, {
      x: titleX,
      y: headerBottom + 38,
      font,
      size: 7.3,
      color: GREEN_MUTED,
    });

    drawCalendarIcon(titleX, headerBottom + 17);
    page.drawText(safeDate(order.createdAt), {
      x: titleX + 12,
      y: headerBottom + 18,
      font: boldFont,
      size: 8,
      color: GREEN_MUTED,
    });

    drawClockIcon(titleX + 100, headerBottom + 21);
    page.drawText(safeTime(order.createdAt), {
      x: titleX + 108,
      y: headerBottom + 18,
      font,
      size: 8,
      color: GREEN_MUTED,
    });

    const totalBoxW = 118;
    const totalBoxH = 52;
    const totalBoxX = PAGE_WIDTH - MARGIN - totalBoxW - 13;
    const totalBoxY = headerBottom + 15;

    page.drawRectangle({
      x: totalBoxX,
      y: totalBoxY,
      width: totalBoxW,
      height: totalBoxH,
      color: GREEN_LIGHT,
      borderColor: GREEN_BORDER,
      borderWidth: 0.8,
    });

    page.drawText("TOTAL", {
      x: totalBoxX + 14,
      y: totalBoxY + 35,
      font: boldFont,
      size: 7.3,
      color: GREEN_MUTED,
    });

    if (subsidyUsed > 0) {
      const before = fmtBefore(priceBeforeSavings);
      const beforeW = font.widthOfTextAtSize(before, 8.1);
      drawStrikeText(
        before,
        totalBoxX + totalBoxW - 12 - beforeW,
        totalBoxY + 34,
        8.1,
      );
    }

    const paid = fmtCurrency(cartTotal);
    const paidW = boldFont.widthOfTextAtSize(paid, 16);
    page.drawText(paid, {
      x: totalBoxX + totalBoxW - 12 - paidW,
      y: totalBoxY + 13,
      font: boldFont,
      size: 16,
      color: GREEN_PRIMARY,
    });

    y = headerBottom - 32;

    drawSectionTitle(`${allProducts.length} items`);

    // Items use the same hierarchy as the dialog: name/category left,
    // original/final/quantity right. Each row is allowed to paginate safely.
    for (const [index, item] of allProducts.entries()) {
      // Misc row - same information shown by OrderDetail.
      if (item.__type === "misc") {
        const quantityText = item.quantity == null ? "" : String(item.quantity);
        const rowHeight = 51;
        ensureSpace(rowHeight + 7);

        const rowTop = y + 7;
        const rowBottom = rowTop - rowHeight;
        const imageBoxX = MARGIN + 10;
        const imageBoxY = rowTop - 44;
        const imageBoxSize = 38;
        const contentX = imageBoxX + imageBoxSize + 10;
        const rightX = PAGE_WIDTH - MARGIN - 12;

        page.drawRectangle({
          x: MARGIN,
          y: rowBottom,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: WHITE,
          borderColor: GREEN_BORDER,
          borderWidth: 0.55,
        });

        page.drawRectangle({
          x: imageBoxX,
          y: imageBoxY,
          width: imageBoxSize,
          height: imageBoxSize,
          color: rgb(0.97, 0.96, 0.94),
          borderColor: GREEN_BORDER,
          borderWidth: 0.55,
        });

        // Simple tag-shaped fallback, replacing an empty image box.
        page.drawSvgPath("M 0 0 L 8 0 L 13 5 L 8 10 L 0 10 Z", {
          x: imageBoxX + 12,
          y: imageBoxY + 14,
          scale: 1,
          color: rgb(0.65, 0.62, 0.57),
        });
        page.drawCircle({
          x: imageBoxX + 15,
          y: imageBoxY + 19,
          size: 1.2,
          color: WHITE,
        });

        page.drawText(
          trimText(item.productName ?? "Misc item", boldFont, 8.7, 300),
          {
            x: contentX,
            y: rowTop - 15,
            font: boldFont,
            size: 8.7,
            color: GREEN_DARK,
          },
        );

        const totalText = fmtCurrency(item.total ?? 0);
        const totalWidth = boldFont.widthOfTextAtSize(totalText, 9.7);
        page.drawText(totalText, {
          x: rightX - totalWidth,
          y: rowTop - 15,
          font: boldFont,
          size: 9.7,
          color: GREEN_DARK,
        });

        drawBadge({
          text: "Misc",
          x: contentX,
          y: rowBottom + 8,
          fill: rgb(0.97, 0.96, 0.94),
          textColor: rgb(0.42, 0.4, 0.37),
          borderColor: rgb(0.86, 0.84, 0.8),
        });

        const unitText = `${fmtCurrency(item.price ?? 0)} × ${quantityText}`;
        const unitWidth = font.widthOfTextAtSize(unitText, 7.1);
        page.drawText(unitText, {
          x: rightX - unitWidth,
          y: rowBottom + 11,
          font,
          size: 7.1,
          color: GREEN_MUTED,
        });

        y -= rowHeight + 6;
        continue;
      }

      const product = item.productId;
      if (!product) continue;

      const imageUrl = getProductImageUrl(product);
      const productImage = await loadProductImage(
        pdfDoc,
        imageUrl,
        req.url,
        req.headers.get("cookie"),
      );

      const itemSubsidy = item.subsidy ?? 0;
      const markup = item.markup ?? 0;
      const lineTotal = Math.round((item.total ?? 0) / (1 + (item.tax ?? 0)));
      const isSubsidizedItem =
        itemSubsidy > 0 ||
        item.__type === "subsidy" ||
        product.subsidised === true;
      const originalLineTotal = lineTotal + itemSubsidy;
      const rawQuantity = Number(item.quantity);
      const quantity =
        Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
      const isMeasuredInWeight = product.isMeasuredInWeight === true;
      const productName = product.name ?? "Unknown product";
      const unitOfMeasure = isMeasuredInWeight ? (product.UOM ?? "") : "";
      const displayedProductName = isMeasuredInWeight
        ? `${productName}/${unitOfMeasure}`
        : productName;
      const displayedQuantity = formatQuantity(quantity);
      const paidUnitPrice = Math.round(lineTotal / quantity);
      const originalUnitPrice = Math.round(originalLineTotal / quantity);
      const hasItemSaving = itemSubsidy > 0 && originalLineTotal > lineTotal;

      const rowHeight = isSubsidizedItem ? 67 : 52;
      ensureSpace(rowHeight + 7);

      const rowTop = y + 7;
      const rowBottom = rowTop - rowHeight;
      const imageBoxX = MARGIN + 10;
      const imageBoxY = rowTop - 45;
      const imageBoxSize = 38;
      const contentX = imageBoxX + imageBoxSize + 10;
      const rightX = PAGE_WIDTH - MARGIN - 12;

      page.drawRectangle({
        x: MARGIN,
        y: rowBottom,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: WHITE,
        borderColor: GREEN_BORDER,
        borderWidth: 0.55,
      });

      page.drawRectangle({
        x: imageBoxX,
        y: imageBoxY,
        width: imageBoxSize,
        height: imageBoxSize,
        color: GREEN_LIGHT,
        borderColor: GREEN_BORDER,
        borderWidth: 0.55,
      });

      if (productImage) {
        const scaled = productImage.scaleToFit(imageBoxSize, imageBoxSize);

        page.drawImage(productImage, {
          x: imageBoxX + (imageBoxSize - scaled.width) / 2,
          y: imageBoxY + (imageBoxSize - scaled.height) / 2,
          width: scaled.width,
          height: scaled.height,
        });
      } else {
        // Never leave a blank box when the product has no usable image.
        const categoryLetter = (
          product.category?.trim().charAt(0) || "?"
        ).toUpperCase();
        const letterSize = 15;
        const letterWidth = boldFont.widthOfTextAtSize(
          categoryLetter,
          letterSize,
        );

        page.drawText(categoryLetter, {
          x: imageBoxX + (imageBoxSize - letterWidth) / 2,
          y: imageBoxY + 12,
          font: boldFont,
          size: letterSize,
          color: GREEN_MUTED,
        });
      }

      const showPriority = product.subsidised !== true;
      const priority = markup >= 100 ? "HIGH" : markup >= 50 ? "MED" : "LOW";
      const priorityFill =
        markup >= 100
          ? rgb(0.94, 0.16, 0.23)
          : markup >= 50
            ? rgb(0.98, 0.75, 0.18)
            : rgb(0.06, 0.72, 0.48);
      const priorityText =
        markup >= 50 && markup < 100 ? rgb(0.3, 0.2, 0.02) : WHITE;
      const priorityWidth = showPriority
        ? boldFont.widthOfTextAtSize(priority, 6.2) + 10
        : 0;

      // Top-right uses LINE totals, exactly like OrderDetail.
      const finalLineText = fmtCurrency(lineTotal);
      const finalLineWidth = boldFont.widthOfTextAtSize(finalLineText, 9.4);
      const originalLineText = fmtCurrency(originalLineTotal);
      const originalLineWidth = hasItemSaving
        ? font.widthOfTextAtSize(originalLineText, 7.2)
        : 0;
      const linePriceWidth =
        finalLineWidth + (hasItemSaving ? originalLineWidth + 6 : 0);

      const topRightStart = rightX - linePriceWidth;
      const priorityX = topRightStart - (showPriority ? priorityWidth + 8 : 0);
      const nameMaxWidth = Math.max(90, priorityX - contentX - 8);

      page.drawText(
        trimText(displayedProductName, boldFont, 8.7, nameMaxWidth),
        {
          x: contentX,
          y: rowTop - 15,
          font: boldFont,
          size: 8.7,
          color: GREEN_DARK,
        },
      );

      if (showPriority) {
        drawBadge({
          text: priority,
          x: priorityX,
          y: rowTop - 21,
          fill: priorityFill,
          textColor: priorityText,
        });
      }

      let linePriceX = topRightStart;

      if (hasItemSaving) {
        drawStrikeText(originalLineText, linePriceX, rowTop - 15, 7.2);
        linePriceX += originalLineWidth + 6;
      }

      page.drawText(finalLineText, {
        x: linePriceX,
        y: rowTop - 16,
        font: boldFont,
        size: 9.4,
        color: hasItemSaving ? AMBER : GREEN_DARK,
      });

      // Bottom row: category + original/current UNIT price x quantity.
      if (product.category) {
        page.drawText(trimText(product.category, font, 7.1, 240), {
          x: contentX,
          y: rowTop - 31,
          font,
          size: 7.1,
          color: GREEN_MUTED,
        });
      }

      const finalUnitFont = hasItemSaving ? boldFont : font;
      const finalUnitColor = hasItemSaving ? AMBER : GREEN_DARK;
      const finalUnitPrefix = `${fmtCurrency(paidUnitPrice)} × ${displayedQuantity}`;
      const finalUnitPrefixWidth = finalUnitFont.widthOfTextAtSize(
        finalUnitPrefix,
        7.1,
      );
      const uomGap = unitOfMeasure ? 0.45 : 0;
      const uomWidth = unitOfMeasure
        ? finalUnitFont.widthOfTextAtSize(unitOfMeasure, 7.1)
        : 0;
      const finalUnitWidth = finalUnitPrefixWidth + uomGap + uomWidth;
      const originalUnitText = fmtCurrency(originalUnitPrice);
      const originalUnitWidth = hasItemSaving
        ? font.widthOfTextAtSize(originalUnitText, 7.1)
        : 0;
      const unitGroupWidth =
        finalUnitWidth + (hasItemSaving ? originalUnitWidth + 6 : 0);
      let unitX = rightX - unitGroupWidth;

      if (hasItemSaving) {
        drawStrikeText(originalUnitText, unitX, rowTop - 31, 7.1);
        unitX += originalUnitWidth + 6;
      }

      page.drawText(finalUnitPrefix, {
        x: unitX,
        y: rowTop - 31,
        font: finalUnitFont,
        size: 7.1,
        color: finalUnitColor,
      });

      if (unitOfMeasure) {
        page.drawText(unitOfMeasure, {
          x: unitX + finalUnitPrefixWidth + uomGap,
          y: rowTop - 31,
          font: finalUnitFont,
          size: 7.1,
          color: finalUnitColor,
        });
      }

      // No orange circle/plus is drawn over the product image.
      if (isSubsidizedItem) {
        const badgeY = rowBottom + 8;

        drawBadge({
          text: "Subsidized",
          x: contentX,
          y: badgeY,
          fill: rgb(1, 0.98, 0.91),
          textColor: rgb(0.73, 0.34, 0.02),
          borderColor: rgb(0.98, 0.75, 0.18),
          sparkle: true,
        });

        if (itemSubsidy > 0) {
          const savedText = `You saved ${fmtCurrency(itemSubsidy)}`;
          const savedWidth = boldFont.widthOfTextAtSize(savedText, 7.1);

          page.drawText(savedText, {
            x: rightX - savedWidth,
            y: badgeY + 3.2,
            font: boldFont,
            size: 7.1,
            color: AMBER,
          });
        }
      }

      y -= rowHeight + 6;
    }
    // Summary card - same fields and wording as OrderDetail.
    const summaryRows = [
      {
        label: "Subtotal",
        value: fmtCurrency(priceBeforeSavings - platformFee),
      },
      {
        label: "Platform Fee",
        value: fmtCurrency(platformFee),
      },
      ...(totalGST > 0
        ? [
            {
              label: "GST (5%)",
              value: fmtCurrency(totalGST),
            },
          ]
        : []),
      ...(totalPST > 0
        ? [
            {
              label: "PST (7%)",
              value: fmtCurrency(totalPST),
            },
          ]
        : []),
      ...(totalFee > 0
        ? [
            {
              label: "Disposable fee",
              value: fmtCurrency(totalFee),
            },
          ]
        : []),
    ];

    const summaryHeight =
      22 + summaryRows.length * 17 + 12 + (subsidyUsed > 0 ? 36 : 0) + 22;

    ensureSpace(summaryHeight + 28);
    y -= 2;
    drawSectionTitle("Summary");

    const summaryTop = y + 7;
    page.drawRectangle({
      x: MARGIN,
      y: summaryTop - summaryHeight,
      width: CONTENT_WIDTH,
      height: summaryHeight,
      color: WHITE,
      borderColor: GREEN_BORDER,
      borderWidth: 0.7,
    });

    y = summaryTop - 18;

    summaryRows.forEach((row) => {
      drawSummaryRow(row.label, row.value);
    });

    drawDivider();

    if (subsidyUsed > 0) {
      drawSummaryRow("Price before savings", fmtCurrency(priceBeforeSavings), {
        strike: true,
      });
      drawSummaryRow("You saved today", `-${fmtCurrency(subsidyUsed)}`, {
        strong: true,
      });
    }

    drawSummaryRow("Total paid", fmtCurrency(cartTotal), {
      strong: true,
    });

    y = summaryTop - summaryHeight - 18;

    const savingsRows = [
      ...(subsidyGenerated > 0
        ? [
            {
              label: "Earned on this order",
              value: fmtCurrency(subsidyGenerated),
              amber: true,
            },
          ]
        : []),
      ...(usedFromOldWallet > 0
        ? [
            {
              label: "Used from Gift Wallet",
              value: fmtCurrency(usedFromOldWallet),
              amber: false,
            },
          ]
        : []),
    ];

    const savingsResultRows = [
      ...(subsidyUsed > 0
        ? [
            {
              label: "Saved on this order",
              value: fmtCurrency(subsidyUsed),
              wallet: false,
            },
          ]
        : []),
      ...(savedToWallet > 0
        ? [
            {
              label: "Saved to your wallet",
              value: fmtCurrency(savedToWallet),
              wallet: true,
            },
          ]
        : []),
    ];

    if (savingsRows.length > 0 || savingsResultRows.length > 0) {
      const hasBothGroups =
        savingsRows.length > 0 && savingsResultRows.length > 0;

      const savingsHeight =
        26 +
        savingsRows.length * 17 +
        (hasBothGroups ? 12 : 0) +
        savingsResultRows.length * 21 +
        12;

      ensureSpace(savingsHeight + 28);
      drawSectionTitle("Savings summary");

      const savingsTop = y + 7;

      page.drawRectangle({
        x: MARGIN,
        y: savingsTop - savingsHeight,
        width: CONTENT_WIDTH,
        height: savingsHeight,
        color: GREEN_LIGHT,
        borderColor: GREEN_BORDER,
        borderWidth: 0.7,
      });

      y = savingsTop - 18;

      savingsRows.forEach((row) => {
        drawSummaryRow(row.label, row.value, {
          amber: row.amber,
        });
      });

      if (hasBothGroups) drawDivider();

      savingsResultRows.forEach((row) => {
        if (row.wallet) {
          const boxHeight = 18;

          page.drawRectangle({
            x: MARGIN + 10,
            y: y - 5,
            width: CONTENT_WIDTH - 20,
            height: boxHeight,
            color: rgb(0.88, 0.96, 0.9),
          });

          drawSummaryRow(row.label, row.value, {
            strong: true,
            xInset: 16,
          });
        } else {
          drawSummaryRow(row.label, row.value, {
            strong: true,
          });
        }
      });

      y = savingsTop - savingsHeight - 18;
    }
    // Footer flows after the content instead of being pinned under it.
    const footerHeight = 54;
    ensureSpace(footerHeight + 12);

    page.drawLine({
      start: { x: MARGIN, y: y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.7,
      color: GREEN_BORDER,
    });

    y -= 34;

    if (logo) {
      const footerLogo = logo.scaleToFit(26, 26);
      page.drawImage(logo, {
        x: MARGIN,
        y: y - 2,
        width: footerLogo.width,
        height: footerLogo.height,
      });
    }

    const footerTextX = MARGIN + (logo ? 36 : 0);

    page.drawText("Thank you for shopping with Candian's Cart!", {
      x: footerTextX,
      y: y + 12,
      font: boldFont,
      size: 10,
      color: GREEN_DARK,
    });

    page.drawText(
      "This receipt was generated automatically. Please keep it for your records.",
      {
        x: footerTextX,
        y,
        font,
        size: 7.2,
        color: GREEN_MUTED,
      },
    );

    const pdfBytes = await pdfDoc.save();
    const filename = `CC-Receipt-${String(order._id)
      .slice(-7)
      .toUpperCase()}-${safeDate(order.createdAt).replace(/\s/g, "-")}.pdf`;

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
