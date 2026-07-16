"use client";

import { useAtomValue } from "jotai";
import GiftWallet from "./GiftWallet";
import TopupWallet from "./TopupWallet";
import { WalletSwitcherAtom, WalletViewEnum } from "@/atoms/customer/Wallet";
import { Customer } from "@/types/customer/customer";
import { getMemberSince } from "@/lib/memberSince";

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
  const activeWallet = useAtomValue(WalletSwitcherAtom);

  const memberSince = getMemberSince(customerData.createdAt);

  const topupWalletData = {
    balance: customerData.walletBalance,
    memberSince,
  };

  const giftWalletData = {
    balance: customerData.giftWalletBalance,
    memberSince,
  };

  return (
    <div className="w-full">
      {/* Mobile and tablet: selected card only */}
      <div className="min-[860px]:hidden">
        <div className="mx-auto w-full max-w-md">
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
      </div>

      {/* Desktop: both cards */}
      <div className="hidden min-[860px]:grid min-[860px]:grid-cols-2 min-[860px]:items-start min-[860px]:gap-6 lg:gap-8">
        <div className="min-w-0">
          <TopupWallet
            topupWalletData={topupWalletData}
            customerId={customerId}
            userRole={userRole}
          />
        </div>

        <div className="min-w-0">
          <GiftWallet giftWalletData={giftWalletData} />
        </div>
      </div>
    </div>
  );
};

export default WalletView;
