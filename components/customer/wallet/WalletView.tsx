"use client";
import { useAtom } from "jotai";
import GiftWallet from "./GiftWallet";
import { WalletSwitcherAtom, WalletViewEnum } from "@/atoms/customer/Wallet";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer/customer";
import { getMemberSince } from "@/lib/memberSince";
import TopupWallet from "./TopupWallet";

type WalletViewProps = {
  customerData: Customer;
  customerId?: string;
  userRole?: string;
};

const WalletView = ({
  customerData,
  customerId,
  userRole,
}: WalletViewProps) => {
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
    <div className="@container w-full">

      {/* Single-card + switcher — container narrower than 860px */}
      <div className="@[860px]:hidden">
        {activeWallet === WalletViewEnum.WALLET ? (
          <TopupWallet
            topupWalletData={topupWalletData}
            customerId={customerId}
            userRole={userRole}
          />
        ) : (
          <GiftWallet giftWalletData={giftWalletData} />
        )}
      </div>

      {/* Side-by-side — grows freely to fill all available space */}
      <div className="hidden @[860px]:flex justify-center w-full p-8">
        <div className="flex-1 min-w-0">
          <TopupWallet
            topupWalletData={topupWalletData}
            customerId={customerId}
            userRole={userRole}
          />
        </div>
        <Separator orientation="vertical" className="mx-8" />
        <div className="flex-1 min-w-0">
          <GiftWallet giftWalletData={giftWalletData} />
        </div>
      </div>

    </div>
  );
};

export default WalletView;