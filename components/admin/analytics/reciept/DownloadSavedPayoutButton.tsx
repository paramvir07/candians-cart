"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  downloadSavedPayoutPdfAction,
  SavedPayoutData,
} from "@/actions/admin/reciept/DownloadReciept";
import { toast } from "sonner";

interface Props {
  payout: SavedPayoutData;
}

export function DownloadSavedPayoutButton({ payout }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Execute the server action to generate the PDF using the saved DB record
      const base64Pdf = await downloadSavedPayoutPdfAction(payout);

      // Prompt user to download
      const linkSource = `data:application/pdf;base64,${base64Pdf}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `payout-receipt-${payout._id}.pdf`;
      downloadLink.click();

      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to generate PDF. Check the console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isDownloading ? "Generating PDF..." : "Download PDF"}
    </Button>
  );
}
