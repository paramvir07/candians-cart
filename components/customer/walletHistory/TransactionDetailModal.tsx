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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatTime } from "@/lib/walletHistory";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";

interface TransactionDetailModalProps {
  transaction: UnifiedTransaction | null;
  onClose: () => void;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "paid" || status === "completed")
    return <CheckCircle2 className="w-12 h-12 text-emerald-500" />;
  if (status === "pending")
    return <Clock className="w-12 h-12 text-amber-500" />;
  return <XCircle className="w-12 h-12 text-red-500" />;
}

function getStatusBg(status: string) {
  if (status === "paid" || status === "completed") return "bg-emerald-50";
  if (status === "pending") return "bg-amber-50";
  return "bg-red-50";
}

function DetailRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between py-2.5 gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-right text-foreground break-all">
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
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

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-center text-base font-semibold">
            {statusLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Status Icon + Amount */}
          <div
            className={cn(
              "rounded-2xl p-6 flex flex-col items-center gap-3",
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

          {/* Details */}
          <div className="bg-muted/30 rounded-2xl px-4 divide-y divide-border/60">
            <DetailRow label="Transaction ID" value={transaction.id} copyable />
            <DetailRow label="Type" value={transaction.label} />
            <DetailRow
              label="Method"
              value={
                transaction.paymentMode === "online"
                  ? "Online (Stripe)"
                  : transaction.paymentMode === "cash"
                    ? "Cash"
                    : "Card"
              }
            />
            <DetailRow
              label="Amount"
              value={formatCurrency(transaction.amount, transaction.currency)}
            />
            <DetailRow label="Date" value={formatDate(transaction.createdAt)} />
            <DetailRow label="Time" value={formatTime(transaction.createdAt)} />
          </div>

          {/* Reference */}
          <div className="flex items-center justify-center gap-2 py-1">
            <PaymentIcon size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {transaction.sublabel}
            </span>
          </div>

          <Button
            onClick={onClose}
            className="w-full rounded-xl h-11 font-semibold bg-primary hover:bg-primary/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
