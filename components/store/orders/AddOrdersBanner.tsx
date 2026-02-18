import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if your Button is elsewhere

export const AddOrderBanner = () => {
  return (
    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-600">
        Want to add a new Order?
      </p>
      
      <Button asChild>
        <Link href="/store/orders/addOrders/" className="flex items-center gap-2">
          <CirclePlus className="h-4 w-4" />
          Add Order
        </Link>
      </Button>
    </div>
  );
};