import { Button } from "@/components/ui/button";
import { TopUpDialog } from "./TopupDialog";
import { WalletInfo } from "./WalletInfo";
import Link from "next/link";

type TopupWalletProps = {
  topupWalletData: {
    balance: number;
    memberSince: string;
  };
  customerId?: string;
  userRole?: string;
};

const TopupWallet = ({ topupWalletData, customerId, userRole }: TopupWalletProps) => {
  return (
    <div>
      <div className="p-4 text-white">
        <div
          className="relative rounded-2xl p-6 space-y-17 lg:space-y-32 overflow-hidden"
          style={{
            backgroundColor: "#2d6a35",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* Blob — top right */}
          <div
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
            style={{ backgroundColor: "#3d8a47", opacity: 0.55 }}
          />

          {/* Blob — bottom left */}
          <div
            className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
            style={{ backgroundColor: "#1e4d25", opacity: 0.65 }}
          />

          {/* Small accent circle — bottom right area */}
          <div
            className="absolute bottom-8 right-10 w-14 h-14 rounded-full pointer-events-none"
            style={{ backgroundColor: "#6abf74", opacity: 0.18 }}
          />

          {/* Squiggle — top left, like the cards in the reference */}
          <svg
            className="absolute -top-2 -left-2 pointer-events-none"
            width="130"
            height="110"
            viewBox="0 0 130 110"
            fill="none"
            style={{ opacity: 0.15 }}
          >
            <path
              d="M-10,70 C15,25 45,90 70,45 C95,5 120,65 145,35"
              stroke="white"
              strokeWidth="22"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col gap-2 justify-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Candian's Cart Wallet
            </p>
            <div className="flex items-center justify-between">
              <h1 className="flex items-center gap-2 text-4xl font-bold font-sans">
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                  }}
                >
                  $
                </span>
                {topupWalletData.balance / 100}
              </h1>
              <WalletInfo />
            </div>
          </div>

          <div className="relative z-10 flex w-full justify-between gap-20">
            <div className="flex flex-col flex-1">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Member Since
              </p>
              <p className="font-semibold text-sm">
                {topupWalletData.memberSince}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 relative flex justify-center gap-1">
        <TopUpDialog customerId={customerId} userRole={userRole}/>
        {!customerId && (
          <Link href="/customer/wallet/history">
            <Button variant="default" className="rounded-full w-full">
              Wallet History
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopupWallet;