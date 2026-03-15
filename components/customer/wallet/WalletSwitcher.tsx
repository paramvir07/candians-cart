"use client";
import { WalletSwitcherAtom, WalletViewEnum } from "@/atoms/customer/Wallet";
import { useAtom } from "jotai";
const WalletSwitcher = () => {
  const [active, setActive] = useAtom(WalletSwitcherAtom);

  return (
    <div className="flex items-center justify-center mt-5 md:hidden gap-2">
      <div className="relative bg-primary p-1 rounded-full flex w-82 md:w-[70%] lg:w-1/2">
        {/* Sliding Indicator */}
        <div
          className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-md transition-all duration-300 ${
            active === WalletViewEnum.WALLET ? "left-1" : "left-[49%]"
          }`}
        />

        <button
          onClick={() => setActive(WalletViewEnum.WALLET)}
          className={`relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors duration-300 ${
            active === WalletViewEnum.WALLET ? "text-black" : "text-white"
          }`}
        >
          Wallet Card
        </button>

        <button
          onClick={() => setActive(WalletViewEnum.GIFT)}
          className={`relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors duration-300 ${
            active === WalletViewEnum.GIFT ? "text-black" : "text-white"
          }`}
        >
          Gift Card
        </button>
      </div>
    </div>
  );
};

export default WalletSwitcher;
