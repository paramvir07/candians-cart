
import { CreditCard, Smartphone, Store, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/walletHistory";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";

interface TransactionItemProps {
  transaction: UnifiedTransaction;
}

function getIcon(transaction: UnifiedTransaction) {
  if (transaction.type === "stripe") return Smartphone;
  if (transaction.paymentMode === "cash") return Store;
  return CreditCard;
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "completed":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "pending":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "unpaid":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

function getIconBg(transaction: UnifiedTransaction) {
  if (transaction.type === "stripe") return "bg-blue-100 text-blue-600";
  if (transaction.paymentMode === "cash")
    return "bg-violet-100 text-violet-600";
  return "bg-indigo-100 text-indigo-600";
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const Icon = getIcon(transaction);
  const iconBg = getIconBg(transaction);

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/40 transition-colors rounded-xl group cursor-pointer">
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
          iconBg,
        )}
      >
        <Icon className="w-4.5 h-4.5" size={18} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {transaction.label}
          </p>
          <span className="text-sm font-bold text-emerald-600 shrink-0">
            +{formatCurrency(transaction.amount, transaction.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {transaction.sublabel}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {formatTime(transaction.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0 h-4 font-medium border",
              getStatusColor(transaction.status),
            )}
          >
            {transaction.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}
