// components/customer/shared/AddressCheckLoader.tsx
import { getCustomerAddress } from "@/actions/customer/getCustomerAddress.action";
import { AddressRequiredDialog } from "./AddressRequiredDialog";

export async function AddressCheckLoader() {
  const address = await getCustomerAddress();
  if (!address) return <AddressRequiredDialog />;
  return null;
}
