import { Suspense } from "react";

import Navbar from "@/components/customer/landing/Navbar";
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher";

import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import WalletSkeleton from "@/components/skeletons/WalletSkeleton";
import WalletViewServer from "@/components/customer/wallet/server/WalletViewServer";

export const metadata = {
  title: "Wallet",
};

export default function Page() {
  return (
    <div>
      <Navbar />

      <WalletSwitcher />

      <Suspense fallback={<WalletSkeleton />}>
        <WalletViewServer />
      </Suspense>

      <CustomerAdvertisements maxHeight={250} />
    </div>
  );
}