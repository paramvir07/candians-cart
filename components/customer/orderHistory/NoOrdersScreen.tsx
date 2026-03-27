import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NoOrdersScreen({
  customerId,
  allOrders
}: {
  customerId?: string;
  allOrders?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 m-4">
        <Link
          href={
            customerId
              ? `/cashier/customer/${customerId}`
              : allOrders
                ? "/cashier"
                : "/customer"
          }
        >
          <Button className="rounded-full" variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
          {customerId ? "Customer order history" : "Order history"}
        </h1>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center gap-6">
        {/* Icon */}

        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-muted-foreground" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-foreground">No orders yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            {customerId
              ? "This customer hasn't placed any orders yet."
              : "You haven't placed any orders yet. Start shopping to see your order history here."}
          </p>
        </div>

        {/* CTA */}
        <Button asChild>
          <Link
            href={customerId ? `/cashier/customer/${customerId}/products` : "/customer/search"}
          >
            Browse products
          </Link>
        </Button>
      </div>
    </>
  );
}
