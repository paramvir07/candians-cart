import { Suspense } from "react";
import CustomerCart from "@canadian-cart/ui/shared/users/CustomerCart";
import { Metadata } from "next";
import CartSkeleton from "@canadian-cart/ui/skeletons/CartSkeleton";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CustomerCart />
    </Suspense>
  );
}