import Navbar from "@/components/customer/landing/Navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { AnimatedEmptyCart } from "./emptyCartAnimation";

export const EmptyCart = ({ customerId }: { customerId?: string }) => {
  return (
    <div
      className={`min-h-screen ${!customerId ? "bg-[#F7F6F3]" : ""}`}
    >
      {!customerId && <Navbar />}

      <div className="px-5 pt-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={customerId ? `/cashier/customer/${customerId}` : "/customer"}>
            <Button className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {customerId ? "Customer's cart" : "My Cart"}
            <span className="text-gray-400 font-normal">(0)</span>
          </h1>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          {/* Icon */}
          <AnimatedEmptyCart/>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {customerId ? "Customer's cart" : "Your Cart"} is empty
          </h2>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Looks like you haven't added anything yet. Browse products and find
            something you love!
          </p>

          <Link
            href={customerId ? `/cashier/customer/${customerId}/products` : "/customer/search"}
            className="mt-8 w-full"
          >
            <Button className="w-full p-5">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};