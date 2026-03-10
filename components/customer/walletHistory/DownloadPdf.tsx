"use client";

import { formatDate } from "@/lib/walletHistory";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";

export async function downloadTransactionPDF(transaction: UnifiedTransaction) {
  let body: string;

  try {
    body = JSON.stringify(transaction);
  } catch (err) {
    throw new Error(
      `Transaction data could not be serialized: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }

  let res: Response;
  try {
    res = await fetch("/api/wallet-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (err) {
    throw new Error(
      `Request to /api/wallet-receipt failed: ${
        err instanceof Error ? err.message : "Network error"
      }`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to generate PDF (${res.status}): ${text}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const safeDate = formatDate(transaction.createdAt).replace(/\s/g, "-");
  const txId = String(transaction.id ?? "unknown");
  const filename = `receipt-${txId.slice(-8).toUpperCase()}-${safeDate}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
