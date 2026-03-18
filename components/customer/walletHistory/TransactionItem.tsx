
import { CreditCard, Smartphone, Store, Clock, Trophy, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { formatTime, formatCurrency, formatDate } from "@/lib/walletHistory";

interface TransactionItemProps {
  transaction: UnifiedTransaction;
}

function getIcon(transaction: UnifiedTransaction) {
  if (transaction.type === "stripe") return Smartphone;
  if (transaction.paymentMode === "cash") return Store;
  if (transaction.paymentMode === "gift") return Gift;
  return CreditCard;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "paid":
    case "completed":
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800";
    case "pending":
      return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800";
    default:
      return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800";
  }
}

function getIconStyle(transaction: UnifiedTransaction) {
  if (transaction.type === "stripe")
    return "bg-blue-100 text-blue-600";
  if (transaction.paymentMode === "cash")
    return "bg-violet-100 text-violet-600";
  if (transaction.paymentMode === "gift")
    return "bg-amber-100/50 text-amber-600";
  return "bg-indigo-100 text-indigo-600";
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const Icon = getIcon(transaction);

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-muted/40 transition-colors rounded-xl group cursor-pointer">
      {/* Icon */}
      <div
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
          getIconStyle(transaction),
        )}
      >
        <Icon size={16} />
      </div>

      {/* Label + sublabel */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {transaction.label}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {transaction.sublabel}
        </p>
        {/* Date shown on mobile only under the sublabel */}
        <p className="text-[10px] text-muted-foreground mt-0.5 sm:hidden">
          {formatDate(transaction.createdAt)}
        </p>
      </div>

      {/* Date — hidden on mobile, shown sm+ */}
      <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[80px]">
        <span className="text-xs text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={9} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {formatTime(transaction.createdAt)}
          </span>
        </div>
      </div>

      {/* Amount + badge */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-bold text-emerald-600">
          +{formatCurrency(transaction.amount, transaction.currency)}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] px-1.5 py-0 h-4 font-medium border mt-1",
            getStatusStyle(transaction.status),
          )}
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}
