import { Suspense } from "react";
import CustomerCart from "@/components/shared/users/CustomerCart";
import { Metadata } from "next";
import CartSkeleton from "@/components/skeletons/CartSkeleton";

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