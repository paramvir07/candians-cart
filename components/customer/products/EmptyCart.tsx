import Navbar from "@/components/customer/landing/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedEmptyCart } from "./emptyCartAnimation";

export const EmptyCart = ({ customerId }: { customerId?: string }) => {
  return (
    <div className={`min-h-screen ${!customerId ? "bg-background" : ""}`}>
      {!customerId && <Navbar />}

      <div className="px-5 pt-6 max-w-md mx-auto">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          {/* Icon */}
          <AnimatedEmptyCart />

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {customerId ? "Customer's cart" : "Your Cart"} is empty
          </h2>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            {customerId
              ? "Scan or browse products to add items to this customer's cart."
              : "Looks like you haven't added anything yet. Browse products and find something you love!"}
          </p>

          <Link
            href={
              customerId
                ? `/cashier/customer/${customerId}/products`
                : "/customer/search"
            }
            className="mt-8 w-full"
          >
            <Button className="w-full p-5">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
