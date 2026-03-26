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
    <div>
      <div className={`md:hidden`}>
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

      <div className={`hidden md:flex justify-center w-full p-8`}>
        <div className="flex-1">
          <TopupWallet
            topupWalletData={topupWalletData}
            customerId={customerId}
            userRole={userRole}
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