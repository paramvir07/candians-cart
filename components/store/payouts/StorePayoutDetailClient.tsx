"use client";

import React, { useState } from "react";
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
  CalendarDays,
  Wallet,
  Loader2,
  Landmark,
  ShoppingCart,
  Store,
  TrendingUp,
  PanelsTopLeft,
  AlertCircle,
} from "lucide-react";
import { SerializedStorePayout } from "@/actions/store/payouts/getStorePayouts";

const formatCurrency = (cents: number | undefined) =>
  `$${((cents || 0) / 100).toFixed(2)}`;

// --- Brand Colors for PDF ---
const GREEN_PRIMARY = rgb(0.38, 0.67, 0.35);
const GREEN_LIGHT = rgb(0.91, 0.97, 0.91);
const GREEN_DARK = rgb(0.18, 0.35, 0.22);
const GRAY_LINE = rgb(0.88, 0.93, 0.88);
const MUTED = rgb(0.52, 0.6, 0.54);
const WHITE = rgb(1, 1, 1);
const RED_ALERT = rgb(0.8, 0.2, 0.2);
const BLUE_LINK = rgb(0.14, 0.38, 0.88);

interface ReceiptRowData {
  label: string;
  value: string;
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
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
  minY: number
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

  const additionalCost = (payout as any).additionalCost || (payout as any).additionalPrice || 0;
  const totalOrders = (payout as any).totalNumberofOrders || (payout as any).orderCount || (payout as any).orderIds?.length || 0;

  // PDF Generation Logic using pdf-lib
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 Size

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = page.getSize();

      const margin = 48;
      const contentWidth = width - margin * 2;

      // --- Header / Footer Helpers ---
      const drawHeader = (targetPage: any, title: string) => {
        targetPage.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: GREEN_PRIMARY });
        targetPage.drawText("Candian's Cart", { x: margin, y: height - 44, font: boldFont, size: 22, color: WHITE });
        targetPage.drawText("Store Payout Details", { x: margin, y: height - 62, font, size: 9, color: rgb(0.8, 0.95, 0.8) });
        const titleW = boldFont.widthOfTextAtSize(title, 22);
        targetPage.drawText(title, { x: width - margin - titleW, y: height - 48, font: boldFont, size: 22, color: WHITE });
      };

      const drawFooter = (targetPage: any) => {
        const footerY = 52;
        targetPage.drawRectangle({ x: 0, y: 0, width, height: footerY, color: GREEN_LIGHT });
        targetPage.drawRectangle({ x: 0, y: footerY, width, height: 1, color: GRAY_LINE });
        targetPage.drawText("Thank you for partnering with Candian's Cart!", { x: margin, y: footerY - 18, font, size: 9, color: MUTED });
        targetPage.drawText(`Receipt generated on ${format(new Date(), "MMM dd, yyyy")}`, { x: margin, y: footerY - 32, font, size: 8, color: rgb(0.72, 0.78, 0.72) });
      };

      // --- Page 1: Financials ---
      const mainTitle = payout.status === "paid" ? "PAID RECEIPT" : "SETTLEMENT";
      drawHeader(page, mainTitle);

      let y = height - 130;

      const drawLabel = (label: string, value: string, yPos: number) => {
        page.drawText(label, { x: margin, y: yPos, font, size: 9, color: MUTED });
        page.drawText(value, { x: margin, y: yPos - 14, font: boldFont, size: 11, color: GREEN_DARK });
      };

      const drawLabelRight = (label: string, value: string, yPos: number) => {
        const valW = boldFont.widthOfTextAtSize(value, 11);
        const lblW = font.widthOfTextAtSize(label, 9);
        page.drawText(label, { x: width - margin - lblW, y: yPos, font, size: 9, color: MUTED });
        page.drawText(value, { x: width - margin - valW, y: yPos - 14, font: boldFont, size: 11, color: GREEN_DARK });
      };

      const drawRow = (label: string, value: string, yPos: number, isBold: boolean = false, customColor?: ReturnType<typeof rgb>) => {
        const activeFont = isBold ? boldFont : font;
        const color = customColor || GREEN_DARK;
        page.drawText(label, { x: margin + 8, y: yPos, font: activeFont, size: 10, color });
        const valW = activeFont.widthOfTextAtSize(value, 10);
        page.drawText(value, { x: width - margin - valW - 8, y: yPos, font: activeFont, size: 10, color });
      };

      const drawSection = (title: string, items: ReceiptRowData[]) => {
        page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 20, color: GREEN_LIGHT });
        page.drawText(title, { x: margin + 8, y: y + 3, font: boldFont, size: 8, color: GREEN_PRIMARY });
        y -= 18;
        let rowIndex = 0;
        for (const item of items) {
          if (rowIndex % 2 === 0) {
            page.drawRectangle({ x: margin, y: y - 6, width: contentWidth, height: 18, color: rgb(0.98, 1, 0.98) });
          }
          drawRow(item.label, item.value, y, item.bold, item.color);
          y -= 18;
          rowIndex++;
        }
        y -= 6;
      };

      // Meta info
      drawLabel("RECEIPT ID", payout._id.toString(), y);
      const periodStr = `${format(new Date(payout.startDate), "MMM dd, yyyy")} - ${format(new Date(payout.endDate), "MMM dd, yyyy")}`;
      drawLabelRight("PERIOD", periodStr, y);

      y -= 44;
      drawLabel("TOTAL REVENUE", formatCurrency((payout.totalCustomerPaid || 0) + ((payout as any).totalSubsidy || 0)), y);
      drawLabelRight("TOTAL ORDERS", String(totalOrders), y);

      y -= 32;
      page.drawRectangle({ x: margin, y, width: contentWidth, height: 1, color: GRAY_LINE });
      y -= 16;

      // Section Data
      const orderBreakdownItems: ReceiptRowData[] = [
        { label: "Total Base Price", value: formatCurrency(payout.totalBasePrice) },
        { label: "Total GST", value: formatCurrency((payout as any).totalGST) },
        { label: "Total PST", value: formatCurrency((payout as any).totalPST) },
        { label: "Total Disposable Fees", value: formatCurrency((payout as any).totalDisposableFee) },
      ];

      const storeBreakdownItems: ReceiptRowData[] = [
        { label: "Total Base Price", value: formatCurrency(payout.totalBasePrice) },
        { label: "Store GST", value: formatCurrency(payout.storebasetaxGST) },
        { label: "Store PST", value: formatCurrency(payout.storebasetaxPST) },
        { label: "Total Disposable Fees", value: formatCurrency((payout as any).totalDisposableFee) },
        { label: "Store Profit (50%)", value: formatCurrency(payout.storeProfit), color: GREEN_PRIMARY },
        { label: "Total Cash Collected", value: `-${formatCurrency(payout.totalWalletTopUpCashCollected)}`, color: MUTED },
        { label: "Total Store Payout", value: formatCurrency(payout.storePayout), bold: true, color: GREEN_PRIMARY },
      ];

      const profitMarginItems: ReceiptRowData[] = [
        { label: "Total Profit Margin", value: formatCurrency(((payout as any).grossMargin || 0) + ((payout as any).totalSubsidy || 0)), bold: true },
        { label: "Subsidy", value: formatCurrency((payout as any).totalSubsidy), color: RED_ALERT },
        { label: "Store Profit (50%)", value: formatCurrency(payout.storeProfit), color: GREEN_PRIMARY },
        { label: "Platform Profit", value: formatCurrency(payout.platformProfit), color: GREEN_PRIMARY },
      ];

      const platformBreakdownItems: ReceiptRowData[] = [
        { label: "Platform GST", value: formatCurrency((payout as any).platformMarkupGSTTax || (payout as any).platformMarkuptax) },
        { label: "Platform PST", value: formatCurrency((payout as any).platformMarkupPSTTax) },
        { label: "Platform Profit", value: formatCurrency(payout.platformProfit), bold: true, color: GREEN_PRIMARY },
      ];

      // Draw Sections
      drawSection("ORDER BREAKDOWN", orderBreakdownItems);
      drawSection("STORE BREAKDOWN", storeBreakdownItems);
      drawSection("PROFIT & MARGINS", profitMarginItems);
      drawSection("PLATFORM BREAKDOWN", platformBreakdownItems);

      // Final Payouts Block
      y -= 8;
      const totalLabelX = width - margin - 220;

      page.drawRectangle({ x: totalLabelX - 12, y: y - 8, width: width - margin - totalLabelX + 12, height: 30, color: GREEN_PRIMARY });
      page.drawText("TOTAL STORE PAYOUT", { x: totalLabelX, y: y + 2, font: boldFont, size: 11, color: WHITE });
      const storePayoutStr = formatCurrency(payout.storePayout);
      const storePayoutStrW = boldFont.widthOfTextAtSize(storePayoutStr, 13);
      page.drawText(storePayoutStr, { x: width - margin - storePayoutStrW, y: y + 2, font: boldFont, size: 13, color: WHITE });

      y -= 36;
      page.drawRectangle({ x: totalLabelX - 12, y: y - 8, width: width - margin - totalLabelX + 12, height: 30, color: GREEN_DARK });
      page.drawText("PLATFORM PROFIT", { x: totalLabelX, y: y + 2, font: boldFont, size: 11, color: WHITE });
      const platformProfitStr = formatCurrency(payout.platformProfit);
      const platformProfitStrW = boldFont.widthOfTextAtSize(platformProfitStr, 13);
      page.drawText(platformProfitStr, { x: width - margin - platformProfitStrW, y: y + 2, font: boldFont, size: 13, color: WHITE });

      drawFooter(page);

      // --- Page 2: Appendix (Notes, Add. Cost & Orders) ---
      const hasNotes = !!payout.additionalNote || !!payout.paymentReciept?.url || additionalCost > 0;
      const hasOrders = (payout as any).orderIds && (payout as any).orderIds.length > 0;

      if (hasNotes || hasOrders) {
        const extraPage = pdfDoc.addPage([595, 842]);
        drawHeader(extraPage, "APPENDIX");
        let extraY = height - 130;

        if (hasNotes) {
          extraPage.drawRectangle({ x: margin, y: extraY - 4, width: contentWidth, height: 20, color: GREEN_LIGHT });
          extraPage.drawText("PAYMENT DETAILS & NOTES", { x: margin + 8, y: extraY + 3, font: boldFont, size: 8, color: GREEN_PRIMARY });
          extraY -= 22;

          if (additionalCost > 0) {
            extraPage.drawText(`Additional Cost: ${formatCurrency(additionalCost)}`, { x: margin + 8, y: extraY, font: boldFont, size: 10, color: RED_ALERT });
            extraY -= 14;
            extraPage.drawText("(Not added in the payout. Charged externally. Please refer to note by admin)", { x: margin + 8, y: extraY, font, size: 9, color: RED_ALERT });
            extraY -= 20;
          }

          if (payout.additionalNote) {
            extraPage.drawText("Notes:", { x: margin + 8, y: extraY, font: boldFont, size: 10, color: GREEN_DARK });
            extraY = drawWrappedText(extraPage, payout.additionalNote, margin + 50, extraY, contentWidth - 60, font, 10, GREEN_DARK, 60);
            extraY -= 12; 
          }

          if (payout.paymentReciept?.url) {
            extraPage.drawText("Receipt Document:", { x: margin + 8, y: extraY, font: boldFont, size: 10, color: GREEN_DARK });
            const receiptUrl = payout.paymentReciept.url;
            const displayUrl = receiptUrl.length > 70 ? receiptUrl.slice(0, 70) + "..." : receiptUrl;
            extraPage.drawText(displayUrl, { x: margin + 110, y: extraY, font, size: 9, color: BLUE_LINK });
            extraY -= 24;
          }
          
          extraY -= 12;
        }

        if (hasOrders) {
          extraPage.drawRectangle({ x: margin, y: extraY - 4, width: contentWidth, height: 20, color: GREEN_LIGHT });
          extraPage.drawText(`INCLUDED ORDERS (${totalOrders})`, { x: margin + 8, y: extraY + 3, font: boldFont, size: 8, color: GREEN_PRIMARY });
          extraY -= 18;

          // Note: using comma joining for order array in PDF
          const orderString = (payout as any).orderIds.join(", ");
          drawWrappedText(extraPage, orderString, margin, extraY, contentWidth, font, 8, MUTED, 60);
        }

        drawFooter(extraPage);
      }

      // Save and Download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Payout_${format(new Date(payout.createdAt), "MMM-dd-yyyy")}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  console.log("Payout",payout.totalNumberofOrders)

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
                {formatCurrency(payout.totalCustomerPaid + ((payout as any).totalSubsidy || 0))}
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
                Platform Profit
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(payout.platformProfit)}
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
                  <ShoppingCart className="w-4 h-4 text-foreground" /> Order Breakdown
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Base Price</span>
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
                    <span className="text-muted-foreground">Total Disposable Fees</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalDisposableFee)}
                    </span>
                  </div>

                  <h2 className="font-semibold flex items-center gap-2 pt-2 text-lg text-blue-700">
                    <Store className="w-4 h-4 text-blue-700" /> Store Breakdown
                  </h2>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Base Price</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(payout.totalBasePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Store GST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(payout.storebasetaxGST)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Store PST</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(payout.storebasetaxPST)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Disposable Fees</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency((payout as any).totalDisposableFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">Store Profit (50%)</span>
                    <span className="font-medium text-blue-700">
                      {formatCurrency(payout.storeProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Total Cash Collected</span>
                    <span>-{formatCurrency(payout.totalWalletTopUpCashCollected)}</span>
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
                      {formatCurrency(((payout as any).grossMargin || 0) + ((payout as any).totalSubsidy || 0))}
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
                    <PanelsTopLeft className="w-4 h-4 text-primary" /> Platform Breakdown
                  </h4>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Platform GST</span>
                      <span>{formatCurrency((payout as any).platformMarkupGSTTax || (payout as any).platformMarkuptax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Platform PST</span>
                      <span>{formatCurrency((payout as any).platformMarkupPSTTax)}</span>
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
                        (Not added in the payout. Charged externally). Please refer to the note by admin below.
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