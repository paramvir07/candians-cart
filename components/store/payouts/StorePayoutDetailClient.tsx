"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  CalendarDays,
  Wallet,
  Loader2,
  Landmark,
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
const BLUE_LINK = rgb(0.14, 0.38, 0.88); 

export default function StorePayoutDetailClient({
  payout,
}: {
  payout: SerializedStorePayout;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

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

      const invoiceLabel = "PAYOUT RECEIPT";
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
        page.drawText(label, {
          x: margin,
          y: yPos,
          font,
          size: 9,
          color: MUTED,
        });
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
      ) => {
        const activeFont = isBold ? boldFont : font;
        page.drawText(label, {
          x: margin + 8,
          y: yPos,
          font: activeFont,
          size: 10,
          color: GREEN_DARK,
        });
        const valW = activeFont.widthOfTextAtSize(value, 10);
        page.drawText(value, {
          x: width - margin - valW - 8,
          y: yPos,
          font: activeFont,
          size: 10,
          color: GREEN_DARK,
        });
      };

      // --- Meta Information ---
      drawLabel("RECEIPT ID", payout._id.slice(-8).toUpperCase(), y);
      const periodStr = `${format(new Date(payout.startDate), "MMM dd, yyyy")} - ${format(new Date(payout.endDate), "MMM dd, yyyy")}`;
      drawLabelRight("PERIOD", periodStr, y);

      y -= 44;
      drawLabel(
        "DATE GENERATED",
        format(new Date(payout.createdAt), "MMM dd, yyyy"),
        y,
      );
      drawLabelRight("STATUS", payout.status.toUpperCase(), y);

      y -= 32;
      page.drawRectangle({
        x: margin,
        y,
        width: contentWidth,
        height: 1,
        color: GRAY_LINE,
      });
      y -= 20;

      // --- Financial Breakdown Section ---
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

      const breakdownItems = [
        {
          label: "Total Customer Paid",
          value: formatCurrency(payout.totalCustomerPaid),
          bold: false,
        },
        {
          label: "Total GST Collected",
          value: formatCurrency(payout.totalGST),
          bold: false,
        },
        {
          label: "Total PST Collected",
          value: formatCurrency(payout.totalPST),
          bold: false,
        },
        {
          label: "Store Profit",
          value: formatCurrency(payout.storeProfit),
          bold: false,
        },
        {
          label: "Cash Collected (From Orders)",
          value: `-${formatCurrency(payout.totalOrderCashCollected)}`,
          bold: false,
        },
        {
          label: "Cash Collected (From Topups)",
          value: `-${formatCurrency(payout.totalWalletTopUpCashCollected)}`,
          bold: false,
        },
        {
          label: "Total Cash Collected",
          value: `-${formatCurrency(payout.totalCashCollected)}`,
          bold: true,
        },
        {
          label: "Platform Profit / Fee",
          value: `-${formatCurrency(payout.platformProfit)}`,
          bold: false,
        },
        {
          label: "Net Store Payout",
          value: formatCurrency(payout.storePayout),
          bold: true,
        },
      ];

      breakdownItems.forEach((item, index) => {
        if (index % 2 === 0) {
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
      });

      y -= 12;

      // --- Final Payout Block ---
      const totalLabelX = width - margin - 220;
      page.drawRectangle({
        x: totalLabelX - 12,
        y: y - 8,
        width: width - margin - totalLabelX + 12,
        height: 30,
        color: GREEN_PRIMARY,
      });

      page.drawText("TOTAL PAYOUT", {
        x: totalLabelX,
        y: y + 2,
        font: boldFont,
        size: 11,
        color: WHITE,
      });
      const storePayoutStr = formatCurrency(payout.storePayout);
      const storePayoutStrW = boldFont.widthOfTextAtSize(storePayoutStr, 13);
      page.drawText(storePayoutStr, {
        x: width - margin - storePayoutStrW,
        y: y + 2,
        font: boldFont,
        size: 13,
        color: WHITE,
      });

      y -= 40;

      // --- Notes Section ---
      if (payout.additionalNote) {
        page.drawText("Additional Notes:", {
          x: margin,
          y,
          font: boldFont,
          size: 10,
          color: GREEN_DARK,
        });
        y -= 16;

        const words = payout.additionalNote.split(" ");
        let line = "";
        words.forEach((word) => {
          const testLine = line + word + " ";
          if (font.widthOfTextAtSize(testLine, 9) > contentWidth) {
            page.drawText(line, { x: margin, y, font, size: 9, color: MUTED });
            line = word + " ";
            y -= 14;
          } else {
            line = testLine;
          }
        });
        page.drawText(line, { x: margin, y, font, size: 9, color: MUTED });

        y -= 8; 
      }

      // --- Payment Receipt URL Section ---
      if (payout.paymentReciept?.url) {
        y -= 24;
        page.drawText("Bank Transfer Document:", {
          x: margin,
          y,
          font: boldFont,
          size: 10,
          color: GREEN_DARK,
        });
        y -= 14;

        const urlStr = payout.paymentReciept.url;
        let line = "";

        for (let i = 0; i < urlStr.length; i++) {
          const char = urlStr[i];
          const testLine = line + char;
          if (font.widthOfTextAtSize(testLine, 9) > contentWidth) {
            page.drawText(line, {
              x: margin,
              y,
              font,
              size: 9,
              color: BLUE_LINK,
            });
            line = char;
            y -= 14;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, {
            x: margin,
            y,
            font,
            size: 9,
            color: BLUE_LINK,
          });
        }
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
      page.drawRectangle({
        x: 0,
        y: footerY,
        width,
        height: 1,
        color: GRAY_LINE,
      });

      page.drawText("Thank you for partnering with Candian's Cart!", {
        x: margin,
        y: footerY - 18,
        font,
        size: 9,
        color: MUTED,
      });
      const supportText = "info@canadianscart.ca";
      const supportW = font.widthOfTextAtSize(supportText, 9);
      page.drawText(supportText, {
        x: width - margin - supportW,
        y: footerY - 18,
        font,
        size: 9,
        color: GREEN_PRIMARY,
      });

      // Save and Download
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Details Card */}
      <Card className="lg:col-span-2 shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-6">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Landmark className="w-5 h-5 text-primary" />
              Payout Summary
            </CardTitle>
            <CardDescription>
              Receipt ID:{" "}
              <span className="font-mono text-xs">
                {payout._id.toUpperCase()}
              </span>
            </CardDescription>
          </div>
          <Badge
            variant={payout.status === "paid" ? "default" : "secondary"}
            className={`px-3 py-1 text-sm ${payout.status === "paid" ? "bg-green-600 hover:bg-green-700" : "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"}`}
          >
            {payout.status.toUpperCase()}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Settlement Period
                </p>
                <p className="font-semibold text-slate-900">
                  {format(new Date(payout.startDate), "MMM dd, yyyy")}
                </p>
                <p className="font-semibold text-slate-900">
                  {format(new Date(payout.endDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Payout Amount
                </p>
                <p className="font-bold text-2xl text-green-700 tracking-tight">
                  {formatCurrency(payout.storePayout)}
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b">
              <h4 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">
                Financial Breakdown
              </h4>
            </div>
            <div className="divide-y bg-white">
              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-muted-foreground font-medium">
                  Total Customer Payments
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(payout.totalCustomerPaid)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-muted-foreground font-medium">
                  Total GST Collected
                </span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(payout.totalGST)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-muted-foreground font-medium">
                  Total PST/HST Collected
                </span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(payout.totalPST)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-muted-foreground font-medium">
                  Store Profit
                </span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(payout.storeProfit)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm bg-orange-50/50">
                <span className="text-muted-foreground font-medium">
                  Cash Collected (From Orders)
                </span>
                <span className="font-medium text-orange-600">
                  -{formatCurrency(payout.totalOrderCashCollected)}
                </span>
              </div>
              
              <div className="flex justify-between items-center px-4 py-3 text-sm bg-orange-50/50">
                <span className="text-muted-foreground font-medium">
                  Cash Collected (From Topups)
                </span>
                <span className="font-medium text-orange-600">
                  -{formatCurrency(payout.totalWalletTopUpCashCollected)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm bg-orange-100/50">
                <span className="font-semibold text-slate-800">
                  Total Cash Collected
                </span>
                <span className="font-bold text-orange-700">
                  -{formatCurrency(payout.totalCashCollected)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 text-sm bg-red-50/50">
                <span className="text-muted-foreground font-medium">
                  Platform Profit / Fees
                </span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(payout.platformProfit)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-4 bg-green-50/50">
                <span className="font-bold text-slate-900">
                  Net Store Payout
                </span>
                <span className="font-bold text-lg text-primary">
                  {formatCurrency(payout.storePayout)}
                </span>
              </div>
            </div>
          </div>

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