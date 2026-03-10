"use client";

import { useState } from "react";
import { downloadReceiptPdfAction } from "@/actions/admin/reciept/DownloadReciept";

interface DownloadButtonProps {
  storeId: string;
  startDateIso: string;
  endDateIso: string;
}

export function DownloadButton({
  storeId,
  startDateIso,
  endDateIso,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Execute the server action to generate the PDF
      const base64Pdf = await downloadReceiptPdfAction(
        storeId,
        startDateIso,
        endDateIso,
      );

      // Prompt user to download
      const linkSource = `data:application/pdf;base64,${base64Pdf}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `receipt-${storeId}.pdf`;
      downloadLink.click();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        padding: "10px 20px",
        backgroundColor: loading ? "#ccc" : "#059142",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: "bold",
        marginBottom: "20px",
      }}
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}
