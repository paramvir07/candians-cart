import { Customer } from "@/types/customer/customer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Wallet,
  Gift,
  Building2,
  Tag,
} from "lucide-react";

type CustomerCardProps = {
  customer: Customer;
  userRole?: string;
};

const CustomerCard = ({ customer, userRole }: CustomerCardProps) => {
  const cashierRole = userRole === "cashier";
  const storeRole = userRole === "store";
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-border/60 bg-card h-full">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 ring-2 ring-primary/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {customer.name}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight">
                #{customer._id.toString().slice(-6).toUpperCase()}
              </p>
              {!cashierRole && !storeRole && (
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </p>
              )}
            </div>
          </div>
          {!cashierRole && !storeRole && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 shrink-0 font-mono"
            >
              <Tag className="w-2.5 h-2.5 mr-1" />
              {customer.referralCode}
            </Badge>
          )}
        </div>

        {/* Location & phone */}
        {!cashierRole && !storeRole && (
          <div className="space-y-1.5 mb-3 flex-1">
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">
                {customer.address}, {customer.city}, {customer.province}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{customer.mobile}</span>
            </div>
          </div>
        )}

        {/* Wallet Stats */}
        {!storeRole && (
          <div className="flex justify-between items-center px-5 pt-3 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Wallet className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold tabular-nums">
                ${(customer.walletBalance / 100).toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">Wallet</p>
            </div>
            <div
              className={`text-center px-3 ${!cashierRole ? "border-x border-border/50" : ""}`}
            >
              <div className="flex items-center justify-center mb-0.5">
                <Gift className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold tabular-nums">
                ${(customer.giftWalletBalance / 100).toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">Gift</p>
            </div>
            {!cashierRole && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-0.5">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold tabular-nums">
                  ${(customer.monthlyBudget / 100).toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Budget</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
