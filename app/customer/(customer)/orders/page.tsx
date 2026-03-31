import CustomerOrders from "@/components/shared/users/orders/CustomerOrders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function Page() {
  return <CustomerOrders />;
}
