import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  ShoppingBag,
  ChevronLeft,
  Wallet,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { CustomerIdParams } from "@/types/cashier/customer";

const customerCardInfo = [
  {
    title: "Cart",
    description: "Review and modify the customer's current cart before checkout.",
    icon: ShoppingCart,
    tip: "Add or remove items before checkout",
    accent: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
    href: "/cart",
    label: "Open Cart",
  },
  {
    title: "Orders",
    description: "View purchase history, reprint receipts, or quickly reorder.",
    icon: Package,
    tip: "Tap an order to reorder items",
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400",
    border: "hover:border-violet-200 dark:hover:border-violet-800",
    href: "/orders",
    label: "View Orders",
  },
  {
    title: "Products",
    description: "Browse the catalogue and add items to the customer's cart.",
    icon: ShoppingBag,
    tip: "Scan a barcode to add instantly",
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
    border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    href: "/products",
    label: "Browse Products",
  },
  {
    title: "Wallet",
    description: "Check balance, top up funds, and review wallet activity.",
    icon: Wallet,
    tip: "Recharge to speed up checkout",
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-800",
    href: "/wallet",
    label: "Open Wallet",
  },
];

const Page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-10 py-8 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/cashier">
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9 shrink-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
                  Customer Quick Access
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage cart, orders, products, and wallet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {customerCardInfo.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={`/cashier/customer/${customerId}${card.href}`}
                className="block group"
              >
                <Card className={`h-full border border-border/60 shadow-none transition-all duration-200 hover:shadow-md ${card.border} cursor-pointer`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 mt-1 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                    </div>

                    <h2 className="text-base font-semibold text-foreground mb-1 tracking-tight">
                      {card.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {card.description}
                    </p>

                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium px-2 py-0.5 bg-muted/60 text-muted-foreground border-0"
                    >
                      {card.tip}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;