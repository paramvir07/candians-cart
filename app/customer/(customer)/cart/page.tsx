import CustomerCart from "@/components/shared/users/CustomerCart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return <CustomerCart />;
}
