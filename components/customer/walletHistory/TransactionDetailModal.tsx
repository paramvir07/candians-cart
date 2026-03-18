"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
  Store,
  Copy,
  Check,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { formatCurrency, formatDate, formatTime } from "@/lib/walletHistory";
import { downloadTransactionPDF } from "./DownloadPdf";

interface TransactionDetailModalProps {
  transaction: UnifiedTransaction | null;
  onClose: () => void;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "paid" || status === "completed")
    return <CheckCircle2 className="w-11 h-11 text-emerald-500" />;
  if (status === "pending")
    return <Clock className="w-11 h-11 text-amber-500" />;
  return <XCircle className="w-11 h-11 text-red-500" />;
}

function getStatusBg(status: string) {
  if (status === "paid" || status === "completed")
    return "bg-emerald-50 dark:bg-emerald-950/30";
  if (status === "pending") return "bg-amber-50 dark:bg-amber-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}

function DetailRow({
  label,
  value,
  copyable,
  mono,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between py-2.5 gap-4">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-xs font-medium text-right text-foreground break-all",
            mono && "font-mono text-[11px]",
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={11} className="text-emerald-500" />
            ) : (
              <Copy size={11} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!transaction) return null;

  const isSuccess =
    transaction.status === "paid" || transaction.status === "completed";
  const statusLabel = isSuccess
    ? "Payment Successful!"
    : transaction.status === "pending"
      ? "Payment Pending"
      : "Payment Failed";

  const PaymentIcon =
    transaction.type === "stripe"
      ? Smartphone
      : transaction.paymentMode === "cash"
        ? Store
        : CreditCard;

  const methodLabel =
    transaction.paymentMode === "online"
      ? "Online via Stripe"
      : transaction.paymentMode === "gift"
        ? "Special Bonus Added 🎉"
        : transaction.paymentMode === "cash"
          ? "Cash at Counter"
          : "Card at Counter";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTransactionPDF
        (transaction);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-center text-base font-semibold">
            {statusLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 pt-4 space-y-3.5">
          {/* Status + Amount */}
          <div
            className={cn(
              "rounded-2xl p-5 flex flex-col items-center gap-2.5",
              getStatusBg(transaction.status),
            )}
          >
            <StatusIcon status={transaction.status} />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-muted/30 rounded-2xl px-4 divide-y divide-border/60">
            <DetailRow
              label="Transaction ID"
              value={transaction.id}
              copyable
              mono
            />
            <DetailRow label="Type" value={transaction.label} />
            <DetailRow label="Method" value={methodLabel} />
            <DetailRow
              label="Amount"
              value={formatCurrency(transaction.amount, transaction.currency)}
            />
            <DetailRow label="Date" value={formatDate(transaction.createdAt)} />
            <DetailRow label="Time" value={formatTime(transaction.createdAt)} />
          </div>

          {/* Source chip */}
          <div className="flex items-center justify-center gap-2 py-0.5">
            <PaymentIcon size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {transaction.sublabel}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 text-sm font-medium gap-1.5"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              className="flex-1 rounded-xl h-10 text-sm font-semibold"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
