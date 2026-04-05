import { WalletInfo } from "./WalletInfo";
type GiftWalletProps = {
  giftWalletData: {
    balance: number;
    memberSince: string;
  };
};
const GiftWallet = ({ giftWalletData }: GiftWalletProps) => {
  return (
    <div>
      <div className="p-4">
        <div
          className="relative rounded-2xl p-6 space-y-10 lg:space-y-17 overflow-hidden text-white bg-black"
          style={{
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* ── GREEN BLOB SPLASH — top left like the reference ── */}
          <div
            className="absolute pointer-events-none bg-primary"
            style={{
              top: "-30px",
              left: "-30px",
              width: "160px",
              height: "150px",
              borderRadius: "60% 40% 55% 45% / 50% 60% 40% 55%",
              filter: "blur(2px)",
              opacity: 0.92,
            }}
          />
          {/* Blob drip extension */}
          <div
            className="absolute pointer-events-none bg-primary"
            style={{
              top: "60px",
              left: "-10px",
              width: "80px",
              height: "70px",
              borderRadius: "40% 60% 65% 35% / 55% 45% 55% 45%",
              filter: "blur(3px)",
              opacity: 0.75,
            }}
          />

          {/* Subtle dark-to-blue gradient on right half */}
          <div className="absolute inset-0 pointer-events-none" />

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col gap-2 justify-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Candian's Gift Card
            </p>
            <div className="flex items-center justify-between">
              <h1
                className="flex items-baseline gap-1 text-4xl font-bold font-sans"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                  }}
                >
                  $
                </span>
                {(giftWalletData.balance/100).toFixed(2)}
              </h1>
              <WalletInfo />
            </div>
          </div>

          {/* Dashed divider */}
          <div className="relative z-10 flex items-center gap-2">
            <div
              className="flex-1 border-t border-dashed"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
            <div
              className="flex-1 border-t border-dashed"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
          </div>

          <div className="relative z-10 flex w-full justify-between gap-20 -mt-3">
            <div className="flex flex-col flex-1">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Member Since
              </p>
              <p className="font-semibold text-sm">
                {giftWalletData.memberSince}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-8.75 px-4 relative flex justify-center gap-1 space-y-2">

            </div>
    </div>
  );
};

export default GiftWallet;
