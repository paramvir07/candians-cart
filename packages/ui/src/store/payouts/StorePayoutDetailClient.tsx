"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Landmark,
  ShoppingCart,
  Store,
  TrendingUp,
  PanelsTopLeft,
  AlertCircle,
} from "lucide-react";
import { SerializedStorePayout } from "@/actions/store/payouts/getStorePayouts";
import ccLogo from "@/app/icon.jpg";

const formatCurrency = (cents: number | undefined) =>
  `$${((cents || 0) / 100).toFixed(2)}`;

interface ReceiptRowData {
  label: string;
  value: string;
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
}

// --- PDF Theme Helpers: reads your global CSS OKLCH variables ---
const WHITE = rgb(1, 1, 1);
const BLACK = rgb(0, 0, 0);

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function oklchToPdfRgb(input: string) {
  const normalized = input.trim();

  const match = normalized.match(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*[\d.]+%?)?\s*\)/i,
  );

  if (!match) return BLACK;

  const l = match[1].includes("%")
    ? parseFloat(match[1]) / 100
    : parseFloat(match[1]);

  const c = parseFloat(match[2]);
  const h = (parseFloat(match[3]) * Math.PI) / 180;

  const a = Math.cos(h) * c;
  const b = Math.sin(h) * c;

  const L = l + 0.3963377774 * a + 0.2158037573 * b;
  const M = l - 0.1055613458 * a - 0.0638541728 * b;
  const S = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = L * L * L;
  const m3 = M * M * M;
  const s3 = S * S * S;

  const linearR = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const toSrgb = (value: number) =>
    value <= 0.0031308
      ? 12.92 * value
      : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

  return rgb(
    clamp01(toSrgb(linearR)),
    clamp01(toSrgb(linearG)),
    clamp01(toSrgb(linearB)),
  );
}

function pdfThemeColor(variableName: string, fallback: string) {
  if (typeof window === "undefined") {
    return oklchToPdfRgb(fallback);
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return oklchToPdfRgb(value || fallback);
}

function getStoreName(payout: SerializedStorePayout) {
  const p = payout as any;

  return (
    p.store?.name ||
    p.store?.storeName ||
    p.store?.businessName ||
    p.store?.title ||
    p.storeId?.name ||
    p.storeId?.storeName ||
    p.storeId?.businessName ||
    p.storeName ||
    p.businessName ||
    p.vendorName ||
    null
  );
}

// --- Helper for wrapping long text in PDF ---
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
  const words = text.split(" ");
  let line = "";
  let currentY = startY;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const textWidth = font.widthOfTextAtSize(testLine, size);

    if (textWidth > maxWidth && line !== "") {
      if (currentY < minY) {
        page.drawText(line + "...", { x, y: currentY, font, size, color });
        return currentY - (size + 4);
      }

      page.drawText(line, { x, y: currentY, font, size, color });
      line = words[i] + " ";
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

export default function StorePayoutDetailClient({
  payout,
}: {
  payout: SerializedStorePayout;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const additionalCost =
    (payout as any).additionalCost || (payout as any).additionalPrice || 0;

  const totalOrders =
    (payout as any).totalNumberofOrders ||
    (payout as any).orderCount ||
    (payout as any).orderIds?.length ||
    0;

  const storeName = getStoreName(payout);

  // PDF Generation Logic using pdf-lib
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { width, height } = page.getSize();

      const margin = 42;
      const contentWidth = width - margin * 2;

      // Theme colors from your global CSS
      const THEME = {
        background: pdfThemeColor("--background", "oklch(1 0 0)"),
        foreground: pdfThemeColor(
          "--foreground",
          "oklch(0.2661 0.0625 153.0394)",
        ),
        card: pdfThemeColor("--card", "oklch(1 0 0)"),
        cardForeground: pdfThemeColor(
          "--card-foreground",
          "oklch(54.598% 0.11155 154.422)",
        ),
        primary: pdfThemeColor("--primary", "oklch(0.6271 0.1699 149.2138)"),
        primaryForeground: pdfThemeColor(
          "--primary-foreground",
          "oklch(1 0 0)",
        ),
        secondary: pdfThemeColor(
          "--secondary",
          "oklch(0.9669 0.0287 158.0617)",
        ),
        secondaryForeground: pdfThemeColor(
          "--secondary-foreground",
          "oklch(0.4104 0.1066 149.9393)",
        ),
        muted: pdfThemeColor("--muted", "oklch(0.9719 0.0055 158.5966)"),
        mutedForeground: pdfThemeColor(
          "--muted-foreground",
          "oklch(0.5252 0.0315 157.3462)",
        ),
        border: pdfThemeColor("--border", "oklch(0.9324 0.0207 158.2303)"),
        destructive: pdfThemeColor(
          "--destructive",
          "oklch(0.6356 0.2082 25.3782)",
        ),
        chart1: pdfThemeColor("--chart-1", "oklch(0.623 0.1688 149.1777)"),
        chart2: pdfThemeColor("--chart-2", "oklch(0.6983 0.1337 165.4626)"),
        chart3: pdfThemeColor("--chart-3", "oklch(0.7858 0.1598 85.3091)"),
      };

      // Same names as your current PDF code, but now powered by your global theme
      const SLATE_900 = THEME.foreground;
      const SLATE_800 = THEME.foreground;
      const SLATE_700 = THEME.cardForeground;
      const SLATE_500 = THEME.mutedForeground;
      const SLATE_300 = THEME.secondary;
      const SLATE_200 = THEME.border;
      const SLATE_100 = THEME.muted;

      const GREEN = THEME.primary;
      const GREEN_LIGHT = THEME.secondary;

      const BLUE = THEME.chart2;
      const BLUE_LIGHT = THEME.secondary;

      const RED = THEME.destructive;
      const RED_LIGHT = THEME.muted;

      const ORANGE = THEME.chart3;
      const ORANGE_LIGHT = THEME.secondary;

      const BLUE_LINK = THEME.chart2;
      const RED_ALERT = THEME.destructive;

      // Load CC logo
      let logoImage: any = null;

      try {
        const logoUrl = typeof ccLogo === "string" ? ccLogo : ccLogo.src;
        const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } catch (error) {
        console.warn("Could not load logo for PDF:", error);
      }

      const drawRoundedRect = (
        targetPage: any,
        x: number,
        y: number,
        w: number,
        h: number,
        color: ReturnType<typeof rgb>,
        borderColor?: ReturnType<typeof rgb>,
      ) => {
        targetPage.drawRectangle({
          x,
          y,
          width: w,
          height: h,
          color,
          borderColor,
          borderWidth: borderColor ? 1 : 0,
        });
      };

      const drawTextRight = (
        targetPage: any,
        text: string,
        xRight: number,
        y: number,
        usedFont: PDFFont,
        size: number,
        color: ReturnType<typeof rgb>,
      ) => {
        const textWidth = usedFont.widthOfTextAtSize(text, size);
        targetPage.drawText(text, {
          x: xRight - textWidth,
          y,
          font: usedFont,
          size,
          color,
        });
      };

const drawHeader = (targetPage: any, title: string) => {
  // Page background
  targetPage.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: THEME.background,
  });

  // Header background - clean white like logo background
  targetPage.drawRectangle({
    x: 0,
    y: height - 108,
    width,
    height: 108,
    color: WHITE,
  });

  // Bottom border for professional separation
  targetPage.drawRectangle({
    x: 0,
    y: height - 109,
    width,
    height: 1,
    color: THEME.border,
  });

  // Logo soft card
  targetPage.drawRectangle({
    x: margin,
    y: height - 76,
    width: 50,
    height: 50,
    color: THEME.secondary,
    borderColor: THEME.border,
    borderWidth: 1,
  });

  if (logoImage) {
    targetPage.drawImage(logoImage, {
      x: margin + 7,
      y: height - 69,
      width: 36,
      height: 36,
    });
  } else {
    targetPage.drawText("CC", {
      x: margin + 11,
      y: height - 58,
      font: boldFont,
      size: 16,
      color: THEME.primary,
    });
  }

  // Brand name with bg-primary / theme primary color
  targetPage.drawText("Candian's Cart", {
    x: margin + 64,
    y: height - 42,
    font: boldFont,
    size: 22,
    color: THEME.primary,
  });

  targetPage.drawText("Store payout receipt", {
    x: margin + 64,
    y: height - 60,
    font,
    size: 10,
    color: THEME.mutedForeground,
  });

  if (storeName) {
    targetPage.drawText(`Store: ${storeName}`, {
      x: margin + 64,
      y: height - 77,
      font: boldFont,
      size: 9,
      color: THEME.foreground,
    });
  }

  // Right title
  const titleW = boldFont.widthOfTextAtSize(title, 20);

  targetPage.drawText(title, {
    x: width - margin - titleW,
    y: height - 44,
    font: boldFont,
    size: 20,
    color: THEME.foreground,
  });

  // Status badge
  const statusText = payout.status?.toUpperCase() || "PENDING";
  const isPaid = payout.status === "paid";

  const badgeBg = isPaid ? THEME.secondary : rgb(1, 0.95, 0.86);
  const badgeText = isPaid ? THEME.primary : rgb(0.75, 0.36, 0.04);

  const badgeW = boldFont.widthOfTextAtSize(statusText, 9) + 24;

  targetPage.drawRectangle({
    x: width - margin - badgeW,
    y: height - 72,
    width: badgeW,
    height: 22,
    color: badgeBg,
    borderColor: isPaid ? THEME.border : rgb(0.95, 0.78, 0.52),
    borderWidth: 1,
  });

  targetPage.drawText(statusText, {
    x: width - margin - badgeW + 12,
    y: height - 65,
    font: boldFont,
    size: 9,
    color: badgeText,
  });
};

      const drawFooter = (targetPage: any) => {
        targetPage.drawRectangle({
          x: 0,
          y: 0,
          width,
          height: 48,
          color: WHITE,
        });

        targetPage.drawRectangle({
          x: 0,
          y: 48,
          width,
          height: 1,
          color: SLATE_200,
        });

        targetPage.drawText("Thank you for partnering with Candian's Cart.", {
          x: margin,
          y: 28,
          font,
          size: 8,
          color: SLATE_500,
        });

        drawTextRight(
          targetPage,
          `Generated on ${format(new Date(), "MMM dd, yyyy")}`,
          width - margin,
          28,
          font,
          8,
          SLATE_500,
        );
      };

      const drawMetricCard = (
        targetPage: any,
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        value: string,
        accentColor: ReturnType<typeof rgb>,
        bgColor: ReturnType<typeof rgb>,
      ) => {
        drawRoundedRect(targetPage, x, y, w, h, WHITE, SLATE_200);

        targetPage.drawRectangle({
          x,
          y: y + h - 4,
          width: w,
          height: 4,
          color: accentColor,
        });

        targetPage.drawText(label.toUpperCase(), {
          x: x + 14,
          y: y + h - 26,
          font: boldFont,
          size: 7.5,
          color: SLATE_500,
        });

        targetPage.drawText(value, {
          x: x + 14,
          y: y + 18,
          font: boldFont,
          size: 18,
          color: accentColor,
        });
      };

      const drawInfoRow = (
        targetPage: any,
        label: string,
        value: string,
        x: number,
        y: number,
        w: number,
        strong = false,
        color: ReturnType<typeof rgb> = SLATE_700,
      ) => {
        targetPage.drawText(label, {
          x,
          y,
          font: strong ? boldFont : font,
          size: 9.5,
          color,
        });

        drawTextRight(
          targetPage,
          value,
          x + w,
          y,
          strong ? boldFont : font,
          9.5,
          color,
        );
      };

      const drawSection = (
        targetPage: any,
        title: string,
        rows: ReceiptRowData[],
        x: number,
        startY: number,
        w: number,
        accentColor: ReturnType<typeof rgb>,
      ) => {
        const rowHeight = 21;
        const sectionHeight = 35 + rows.length * rowHeight + 12;

        drawRoundedRect(
          targetPage,
          x,
          startY - sectionHeight,
          w,
          sectionHeight,
          WHITE,
          SLATE_200,
        );

        targetPage.drawRectangle({
          x,
          y: startY - 35,
          width: w,
          height: 35,
          color: SLATE_100,
        });

        targetPage.drawRectangle({
          x,
          y: startY - 35,
          width: 4,
          height: 35,
          color: accentColor,
        });

        targetPage.drawText(title, {
          x: x + 14,
          y: startY - 22,
          font: boldFont,
          size: 12,
          color: SLATE_800,
        });

        let rowY = startY - 56;

        rows.forEach((row, index) => {
          if (index % 2 === 1) {
            targetPage.drawRectangle({
              x: x + 10,
              y: rowY - 6,
              width: w - 20,
              height: rowHeight,
              color: rgb(0.985, 0.99, 1),
            });
          }

          drawInfoRow(
            targetPage,
            row.label,
            row.value,
            x + 14,
            rowY,
            w - 28,
            row.bold,
            row.color || SLATE_700,
          );

          rowY -= rowHeight;
        });

        return startY - sectionHeight - 16;
      };

      const drawWrapped = (
        targetPage: any,
        text: string,
        x: number,
        startY: number,
        maxWidth: number,
        usedFont: PDFFont,
        size: number,
        color: ReturnType<typeof rgb>,
      ) => {
        const words = text.split(" ");
        let line = "";
        let currentY = startY;

        words.forEach((word) => {
          const testLine = `${line}${word} `;
          const textWidth = usedFont.widthOfTextAtSize(testLine, size);

          if (textWidth > maxWidth && line !== "") {
            targetPage.drawText(line.trim(), {
              x,
              y: currentY,
              font: usedFont,
              size,
              color,
            });

            line = `${word} `;
            currentY -= size + 5;
          } else {
            line = testLine;
          }
        });

        if (line.trim()) {
          targetPage.drawText(line.trim(), {
            x,
            y: currentY,
            font: usedFont,
            size,
            color,
          });

          currentY -= size + 5;
        }

        return currentY;
      };

      const mainTitle =
        payout.status === "paid" ? "PAID RECEIPT" : "SETTLEMENT";
      drawHeader(page, mainTitle);

      let y = height - 124;

      // Receipt metadata card
      drawRoundedRect(page, margin, y - 62, contentWidth, 62, WHITE, SLATE_200);

      page.drawText("Receipt ID", {
        x: margin + 16,
        y: y - 22,
        font,
        size: 8,
        color: SLATE_500,
      });

      page.drawText(payout._id.toString(), {
        x: margin + 16,
        y: y - 40,
        font,
        size: 9,
        color: SLATE_800,
      });

      const periodStr = `${format(new Date(payout.startDate), "MMM dd, yyyy")} - ${format(
        new Date(payout.endDate),
        "MMM dd, yyyy",
      )}`;

      drawTextRight(
        page,
        "Period",
        width - margin - 16,
        y - 22,
        font,
        8,
        SLATE_500,
      );
      drawTextRight(
        page,
        periodStr,
        width - margin - 16,
        y - 40,
        boldFont,
        9,
        SLATE_800,
      );

      y -= 88;

      // Metrics grid, matching your component
      const gap = 12;
      const metricW = (contentWidth - gap) / 2;
      const metricH = 72;

      drawMetricCard(
        page,
        margin,
        y - metricH,
        metricW,
        metricH,
        "Total Revenue",
        formatCurrency(payout.totalRevenue || 0),
        SLATE_900,
        SLATE_100,
      );

      drawMetricCard(
        page,
        margin + metricW + gap,
        y - metricH,
        metricW,
        metricH,
        "Store Payout",
        formatCurrency(payout.storePayout),
        BLUE,
        BLUE_LIGHT,
      );

      y -= metricH + gap;

      drawMetricCard(
        page,
        margin,
        y - metricH,
        metricW,
        metricH,
        "Store Profit 50%",
        formatCurrency(payout.storeProfit),
        GREEN,
        GREEN_LIGHT,
      );

      drawMetricCard(
        page,
        margin + metricW + gap,
        y - metricH,
        metricW,
        metricH,
        "Total Orders",
        String(totalOrders),
        SLATE_900,
        SLATE_100,
      );

      y -= metricH + 26;

      const orderBreakdownItems: ReceiptRowData[] = [
        {
          label: "Total Base Price",
          value: formatCurrency(payout.totalBasePrice),
        },
        {
          label: "Total GST",
          value: formatCurrency((payout as any).totalGST),
        },
        {
          label: "Total PST",
          value: formatCurrency((payout as any).totalPST),
        },
        {
          label: "Total Disposable Fees",
          value: formatCurrency((payout as any).totalDisposableFee),
        },
      ];

      const storeBreakdownItems: ReceiptRowData[] = [
        {
          label: "Total Base Price",
          value: formatCurrency(payout.totalBasePrice),
        },
        {
          label: "Store GST",
          value: formatCurrency(payout.storebasetaxGST + payout.storeMarkupTax),
        },
        {
          label: "Store PST",
          value: formatCurrency(payout.storebasetaxPST),
        },
        {
          label: "Total Disposable Fees",
          value: formatCurrency((payout as any).totalDisposableFee),
        },
        {
          label: "Store Profit (50%)",
          value: formatCurrency(payout.storeProfit),
          color: BLUE,
        },
        {
          label: "Total",
          value: formatCurrency(
            payout.storePayout + payout.totalWalletTopUpCashCollected,
          ),
          bold: true,
          color: BLUE,
        },
        {
          label: "Total Cash Collected",
          value: `-${formatCurrency(payout.totalWalletTopUpCashCollected)}`,
          color: SLATE_900,
        },
        {
          label: "Total Store Payout",
          value: formatCurrency(payout.storePayout),
          bold: true,
          color: BLUE,
        },
      ];

      const profitMarginItems: ReceiptRowData[] = [
        {
          label: "Total Profit Margin",
          value: formatCurrency(payout.profitMargin || 0),
          bold: true,
        },
        {
          label: "Subsidy",
          value: formatCurrency((payout as any).totalSubsidy),
          color: RED,
        },
        {
          label: "Store Profit (50%)",
          value: formatCurrency(payout.storeProfit),
          color: BLUE,
        },
        {
          label: "Platform Profit",
          value: formatCurrency(payout.platformProfit),
          color: GREEN,
        },
      ];

      const platformBreakdownItems: ReceiptRowData[] = [
        {
          label: "Platform GST",
          value: formatCurrency(
            (payout as any).platformMarkupGSTTax ||
              (payout as any).platformMarkuptax,
          ),
        },
        {
          label: "Platform PST",
          value: formatCurrency((payout as any).platformMarkupPSTTax),
        },
        {
          label: "Platform Profit",
          value: formatCurrency(payout.platformProfit),
          bold: true,
          color: GREEN,
        },
      ];

      // Two-column sections like your component layout
      const sectionGap = 14;
      const colW = (contentWidth - sectionGap) / 2;

      let leftY = y;
      let rightY = y;

      leftY = drawSection(
        page,
        "Order Breakdown",
        orderBreakdownItems,
        margin,
        leftY,
        colW,
        SLATE_900,
      );

      leftY = drawSection(
        page,
        "Store Breakdown",
        storeBreakdownItems,
        margin,
        leftY,
        colW,
        BLUE,
      );

      rightY = drawSection(
        page,
        "Profit & Margins",
        profitMarginItems,
        margin + colW + sectionGap,
        rightY,
        colW,
        GREEN,
      );

      rightY = drawSection(
        page,
        "Platform Breakdown",
        platformBreakdownItems,
        margin + colW + sectionGap,
        rightY,
        colW,
        GREEN,
      );

      y = Math.min(leftY, rightY) - 6;

      // Final payout strip
      drawRoundedRect(page, margin, y - 58, contentWidth, 58, SLATE_900);

      page.drawText("Total Store Payout", {
        x: margin + 18,
        y: y - 23,
        font: boldFont,
        size: 11,
        color: WHITE,
      });

      page.drawText("Amount payable to store", {
        x: margin + 18,
        y: y - 39,
        font,
        size: 8,
        color: SLATE_300,
      });

      drawTextRight(
        page,
        formatCurrency(payout.storePayout),
        width - margin - 18,
        y - 31,
        boldFont,
        18,
        WHITE,
      );

      drawFooter(page);

      // Appendix page for notes, cost, and receipt link
      const hasNotes =
        !!payout.additionalNote ||
        !!payout.paymentReciept?.url ||
        additionalCost > 0;

      if (hasNotes) {
        const extraPage = pdfDoc.addPage([595, 842]);
        drawHeader(extraPage, "APPENDIX");

        let extraY = height - 126;

        drawRoundedRect(
          extraPage,
          margin,
          extraY - 42,
          contentWidth,
          42,
          WHITE,
          SLATE_200,
        );

        extraPage.drawText("Payment Details & Notes", {
          x: margin + 16,
          y: extraY - 25,
          font: boldFont,
          size: 14,
          color: SLATE_900,
        });

        extraY -= 68;

        if (additionalCost > 0) {
          drawRoundedRect(
            extraPage,
            margin,
            extraY - 76,
            contentWidth,
            76,
            RED_LIGHT,
            rgb(0.96, 0.72, 0.72),
          );

          extraPage.drawText(
            `Additional Cost: ${formatCurrency(additionalCost)}`,
            {
              x: margin + 16,
              y: extraY - 26,
              font: boldFont,
              size: 12,
              color: RED,
            },
          );

          extraPage.drawText(
            "Not added in the payout. Charged externally. Please refer to the admin note.",
            {
              x: margin + 16,
              y: extraY - 47,
              font,
              size: 9,
              color: RED,
            },
          );

          extraY -= 96;
        }

        if (payout.additionalNote) {
          drawRoundedRect(
            extraPage,
            margin,
            extraY - 110,
            contentWidth,
            110,
            BLUE_LIGHT,
            rgb(0.73, 0.84, 1),
          );

          extraPage.drawText("Message from Admin", {
            x: margin + 16,
            y: extraY - 26,
            font: boldFont,
            size: 12,
            color: BLUE,
          });

          drawWrapped(
            extraPage,
            payout.additionalNote,
            margin + 16,
            extraY - 48,
            contentWidth - 32,
            font,
            9.5,
            SLATE_800,
          );

          extraY -= 132;
        }

        if (payout.paymentReciept?.url) {
          drawRoundedRect(
            extraPage,
            margin,
            extraY - 76,
            contentWidth,
            76,
            WHITE,
            SLATE_200,
          );

          extraPage.drawText("Bank Transfer Document", {
            x: margin + 16,
            y: extraY - 26,
            font: boldFont,
            size: 12,
            color: SLATE_900,
          });

          const receiptUrl = payout.paymentReciept.url;
          const displayUrl =
            receiptUrl.length > 82
              ? `${receiptUrl.slice(0, 82)}...`
              : receiptUrl;

          extraPage.drawText(displayUrl, {
            x: margin + 16,
            y: extraY - 48,
            font,
            size: 8.5,
            color: BLUE,
          });
        }

        drawFooter(extraPage);
      }

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Payout_${format(
        new Date(payout.createdAt),
        "MMM-dd-yyyy",
      )}.pdf`;

      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  console.log("Payout", payout.totalNumberofOrders);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Details Card */}
      <Card className="lg:col-span-2 shadow-sm border-slate-200 h-fit">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-6">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Landmark className="w-5 h-5 text-primary" />
              Payout Summary
            </CardTitle>
            <CardDescription>
              Receipt ID:{" "}
              <span className="font-mono text-xs">{payout._id.toString()}</span>
            </CardDescription>
          </div>
          <Badge
            variant={payout.status === "paid" ? "default" : "secondary"}
            className={`px-3 py-1 text-sm ${payout.status === "paid" ? "bg-green-600 hover:bg-green-700" : "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"}`}
          >
            {payout.status.toUpperCase()}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {/* Big Top Metrics Grid */}
          <div className="grid grid-cols-2 divide-x divide-y border-b bg-muted/10">
            <div className="p-4 flex flex-col justify-center">
              <span className="text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">
                Total Revenue
              </span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(payout.totalRevenue || 0)}
              </span>
            </div>
            <div className="p-4 flex flex-col justify-center">
              <span className="text-xs text-blue-700 font-medium mb-1 uppercase tracking-wider">
                Store Payout
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {formatCurrency(payout.storePayout)}
              </span>
            </div>
            <div className="p-4 flex flex-col justify-center">
              <span className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">
                Store Profit (50%)
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(payout.storeProfit)}
              </span>
            </div>
            <div className="p-4 flex flex-col justify-center">
              <span className="text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">
                Total Orders
              </span>
              <span className="text-2xl font-bold text-foreground">
                {payout.totalNumberofOrders}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Timeline */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <span className="text-muted-foreground">Period Start:</span>
              <span className="font-medium text-right">
                {format(new Date(payout.startDate), "MMM dd, yyyy")}
              </span>
              <span className="text-muted-foreground">Period End:</span>
              <span className="font-medium text-right">
                {format(new Date(payout.endDate), "MMM dd, yyyy")}
              </span>
            </div>

            <div className="space-y-8">
              {/* Column 1: Order Breakdown & Store Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-foreground text-lg">
                  <ShoppingCart className="w-4 h-4 text-foreground" /> Order
                  Breakdown
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Base Price
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(payout.totalBasePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total GST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalGST)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total PST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalPST)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Disposable Fees
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalDisposableFee)}
                    </span>
                  </div>

                  <h2 className="font-semibold flex items-center gap-2 pt-2 text-lg text-blue-700">
                    <Store className="w-4 h-4 text-blue-700" /> Store Breakdown
                  </h2>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Base Price
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(payout.totalBasePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Store GST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(
                        payout.storebasetaxGST + payout.storeMarkupTax,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Store PST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(payout.storebasetaxPST)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Disposable Fees
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalDisposableFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">
                      Store Profit (50%)
                    </span>
                    <span className="font-medium text-blue-700">
                      {formatCurrency(payout.storeProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-medium text-blue-700 mt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        payout.storePayout +
                          payout.totalWalletTopUpCashCollected,
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-black">
                    <span>Total Cash Collected</span>
                    <span>
                      -{formatCurrency(payout.totalWalletTopUpCashCollected)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-medium text-blue-700 mt-2">
                    <span>Total Store Payout</span>
                    <span>{formatCurrency(payout.storePayout)}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Margins, Profits & Platform Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-foreground/80 text-lg">
                  <TrendingUp className="w-4 h-4" /> Profit & Margins
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Profit Margin</span>
                    <span className="font-bold">
                      {formatCurrency(payout.profitMargin || 0)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-medium text-pink-700">
                    <span>Subsidy</span>
                    <span>{formatCurrency((payout as any).totalSubsidy)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium text-blue-700">
                    <span>Store Profit (50%)</span>
                    <span>{formatCurrency(payout.storeProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-primary mt-2">
                    <span>Platform Profit</span>
                    <span>{formatCurrency(payout.platformProfit)}</span>
                  </div>

                  <h4 className="font-semibold flex items-center gap-2 text-primary pt-2 text-lg">
                    <PanelsTopLeft className="w-4 h-4 text-primary" /> Platform
                    Breakdown
                  </h4>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Platform GST</span>
                      <span>
                        {formatCurrency((payout as any).platformMarkupGSTTax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Platform PST</span>
                      <span>
                        {formatCurrency((payout as any).platformMarkupPSTTax)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-primary mt-2">
                    <span>Platform Profit</span>
                    <span>{formatCurrency(payout.platformProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Cost Callout & Admin Note */}
            {(additionalCost > 0 || payout.additionalNote) && (
              <div className="mt-8 space-y-4">
                {additionalCost > 0 && (
                  <div className="bg-red-50/80 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-1">
                        Additional Cost: {formatCurrency(additionalCost)}
                      </h4>
                      <p className="text-sm text-red-800/90 leading-relaxed">
                        (Not added in the payout. Charged externally). Please
                        refer to the note by admin below.
                      </p>
                    </div>
                  </div>
                )}

                {payout.additionalNote && (
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Message from Admin
                      </h4>
                      <p className="text-sm text-blue-800/90 whitespace-pre-wrap leading-relaxed">
                        {payout.additionalNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Side Actions Column */}
      <div className="space-y-6">
        {/* PDF Generator */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Export Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-5">
              Download a formally formatted PDF copy of this payout summary for
              your accounting records.
            </p>
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating
                  PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Uploaded Document */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Bank Transfer Doc</CardTitle>
          </CardHeader>
          <CardContent>
            {payout.paymentReciept ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  An official transfer receipt or proof of payment was uploaded
                  by the platform.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Link
                    href={payout.paymentReciept.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed">
                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-muted-foreground italic text-center">
                  No external bank document attached.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
