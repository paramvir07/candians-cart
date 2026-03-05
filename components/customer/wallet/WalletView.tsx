"use client";
import { useAtom } from "jotai";
import GiftWallet from "./GiftWallet";
import TopupWallet from "./TopupWallet";
import { WalletSwitcherAtom, WalletViewEnum } from "@/atoms/customer/Wallet";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer/customer";
import { getMemberSince } from "@/lib/memberSince";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type WalletViewProps = {
  customerData: Customer;
  customerId?: string;
};
const WalletView = ({ customerData, customerId }: WalletViewProps) => {
  const topupWalletData = {
    balance: customerData.walletBalance,
    memberSince: getMemberSince(customerData.createdAt),
  };
  const giftWalletData = {
    balance: customerData.giftWalletBalance,
    memberSince: getMemberSince(customerData.createdAt),
  };

  const [activeWallet] = useAtom(WalletSwitcherAtom);
  return (
    <div>
      <div className="md:hidden">
        {activeWallet === WalletViewEnum.WALLET ? (
          <TopupWallet topupWalletData={topupWalletData} />
        ) : (
          <GiftWallet giftWalletData={giftWalletData} />
        )}
      </div>

      <div className="w-full justify-center p-8 hidden md:flex">
        {customerId && (
          <Link href={customerId ? `/cashier/customer/${customerId}` : "/"}>
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
        )}
        <div className="flex-1">
          <TopupWallet
            topupWalletData={topupWalletData}
            customerId={customerId}
          />
        </div>
        <Separator orientation="vertical" className="mx-8" />
        <div className="flex-1">
          <GiftWallet giftWalletData={giftWalletData} />
        </div>
      </div>
    </div>
  );
};

export default WalletView;
