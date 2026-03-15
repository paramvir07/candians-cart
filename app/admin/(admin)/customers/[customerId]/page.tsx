import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  ShoppingCart,
  Package,
  ShoppingBag,
  ChevronLeft,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { CustomerIdParams } from "@/types/cashier/customer";

const customerCardInfo = [

  {
    title: "Wallet",
    description: "Check balance, recharge funds, and review wallet activity.",
    icon: Wallet,
    highlights: [
      { label: "Tip", value: "Recharge to speed up checkout" },
    ],
    actions: [
      { label: "Open Wallet", variant: "default" as const, href: "/wallet" },
    ],
  },
];

const Page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;

  return (
    <div className="max-h-screen w-full bg-linear-to-b from-background to-muted/40 py-8 md:pl-10">
      <div className="mx-auto w-full max-w-6xl pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Link href={"/admin/customers"}>
              <Button className="rounded-full" variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
              Customer Quick Access
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Select what you need to prepare the customer’s order: cart, order
            history, or products.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {customerCardInfo.map((card, index) => {
            const Icon = card.icon;

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-muted/60 bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/50
                           transition hover:-translate-y-1 hover:shadow-lg focus-within:shadow-lg max-w-80"
              >
                {/* top accent */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />

                {/* Make all cards consistent height + better layout */}
                <div className="flex h-full flex-col">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {card.description}
                        </CardDescription>
                      </div>

                      <div className="shrink-0 rounded-xl border bg-background/60 p-2 sm:p-2.5 text-primary shadow-sm">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4">
                    {/* Highlights */}
                    <div className="space-y-3">
                      {card.highlights.map((h, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="text-sm text-muted-foreground">
                            {h.label}
                          </span>
                          <span className="text-sm font-medium text-right">
                            {h.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Actions pinned toward bottom */}
                    <div className="mt-auto flex flex-col gap-2">
                      <Link
                        href={`/admin/customers/${customerId}${card.actions[0].href}`}
                      >
                        <Button
                          className="w-full h-10 sm:h-11"
                          variant={card.actions[0].variant}
                        >
                          {card.actions[0].label}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;
