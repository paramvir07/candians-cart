import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NoOrdersScreen({
  customerId,
}: {
  customerId?: string;
}) {
  return (
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
          <Link href={customerId ? `/cashier/customer/${customerId}/products` : "/"}>Browse products</Link>
        </Button>
    </div>
  );
}
