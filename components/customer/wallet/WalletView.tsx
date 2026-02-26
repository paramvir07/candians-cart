"use client";
import { useAtom } from "jotai";
import GiftWallet from "./GiftWallet";
import TopupWallet from "./TopupWallet";
import { WalletSwitcherAtom, WalletViewEnum } from "@/atoms/customer/Wallet";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer/customer";
import { getMemberSince } from "@/lib/momberSince";

type WalletViewProps = {
  customerData: Customer;
};
const WalletView = ({ customerData }: WalletViewProps) => {
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
        <div className="flex-1">
          <TopupWallet topupWalletData={topupWalletData} />
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
