"use client"
import { useState, useEffect, useRef } from "react"
import { SubsidizedPopup } from "./SubsidizedPopup"
import { useAtom } from "jotai"
import { SubsidyValue, UsedSubsidy } from "@/atoms/customer/CartAtom"
import { Tag, ChevronRight, Gift, Wallet, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClearAllSubsidyItems, updateCartSubsidy } from "@/actions/customer/SubsidyItems.Action"
import { getFibBracketFrom21 } from "@/lib/FibBracket"


const ProgressBarCart = ({ total, customerId, giftWalletBalance, SubsidyonOrder, subItemIds }: {
  SubsidyonOrder: number
  Totalsubsidy: number
  totalMarkup: number
  total: number
  customerId?: string
  giftWalletBalance?: number
  subItemIds?: string[]
}) => {

  const [dialogOpen, setDialogOpen] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  const [SubsidyVal, setSubsidyVal] = useAtom(SubsidyValue)
  const [, setUsedSubsidy] = useAtom(UsedSubsidy)

  const amount = total / 100
  const giftBalance = (giftWalletBalance ?? 0) / 100
  const { prev, current, mid } = getFibBracketFrom21(amount)
  const progressValue = current === prev ? 100 : Math.min(((amount - prev) / (current - prev)) * 100, 100)

  const lastMilestoneRef = useRef<number | null>(null)
  const lastSubsidyRef = useRef<number | null>(null)
  const prevAmountRef = useRef<number | null>(null)

  useEffect(() => {
  if (!subItemIds || subItemIds.length === 0) {
    setUsedSubsidy(0)
  }
}, [subItemIds])

  useEffect(() => {
    setSubsidyVal((SubsidyonOrder / 100) + giftBalance)

    const prevAmount = prevAmountRef.current

    if (amount < 21) {
      setShowBtn(false)
      setDialogOpen(false)
      if (prevAmount !== null && prevAmount >= 21) {
        lastMilestoneRef.current = null
        lastSubsidyRef.current = null
        ClearAllSubsidyItems(customerId)
        setUsedSubsidy(0) 
      }
      prevAmountRef.current = amount
      return
    }

    prevAmountRef.current = amount

    if (lastSubsidyRef.current === SubsidyonOrder) return
    lastSubsidyRef.current = SubsidyonOrder

    updateCartSubsidy((SubsidyonOrder), customerId)

    if (lastMilestoneRef.current !== prev) {
      lastMilestoneRef.current = prev
      setShowBtn(true)
    }
  }, [SubsidyonOrder, amount, prev, giftBalance])


  return (
    <>
      <div className="relative w-full">
        <div className="relative flex justify-between items-end mb-2.5 px-0.5">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            ${prev}
          </span>

          {mid && (
            <div
              className="absolute bottom-0 flex flex-col items-center gap-0.5 -translate-x-1/2"
              style={{ left: `${((mid - prev) / (current - prev)) * 100}%` }}
            >
              <span className="text-[12px] font-bold text-primary">${mid}</span>
            </div>
          )}

          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            ${current}
          </span>
        </div>

        <div className="relative h-3.5 w-full rounded-full overflow-hidden"
          style={{ background: "var(--secondary)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 11px, oklch(0.6271 0.1699 149.2138 / 0.15) 11px, oklch(0.6271 0.1699 149.2138 / 0.15) 12px)" }}
          />

          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressValue}%`,
              background: "linear-gradient(90deg, oklch(0.5271 0.1699 149.2138), oklch(0.6271 0.1699 149.2138) 60%, oklch(0.7227 0.192 149.5793))",
              boxShadow: "0 0 14px oklch(0.6271 0.1699 149.2138 / 0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
            <div className="absolute top-0 bottom-0 w-10 opacity-0"
              style={{
                right: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                animation: "cartShimmer 2.4s ease-in-out infinite",
              }}
            />
          </div>

          {mid && (
            <div
              className="absolute top-0 bottom-0 w-px z-10"
              style={{
                left: `${((mid - prev) / (current - prev)) * 100}%`,
                background: "oklch(0.6271 0.1699 149.2138 / 0.5)",
              }}
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "var(--primary)" }} />
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "var(--primary)" }} />
            </div>
          )}
        </div>

        {progressValue > 0 && progressValue < 100 && (
          <div className="mt-2 flex justify-end">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-0.5 tracking-wide"
              style={{
                color: "var(--primary)",
                background: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
              {progressValue < 50 ? "Add more to unlock subsidy" : "Almost at next milestone!"}
            </span>
          </div>
        )}

        <style>{`
          @keyframes cartShimmer {
            0%   { opacity: 0; transform: translateX(-20px); }
            40%  { opacity: 1; }
            100% { opacity: 0; transform: translateX(10px); }
          }

          .subsidy-btn-wrap {
            overflow: hidden;
            max-height: 0;
            margin-top: 0;
            opacity: 0;
            transform: translateY(-6px);
            transition:
              max-height 320ms ease-in-out,
              margin-top 320ms ease-in-out,
              opacity 280ms ease-in-out,
              transform 280ms ease-in-out;
            pointer-events: none;
          }

          .subsidy-btn-show {
            max-height: 56px;
            margin-top: 12px;
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
        `}</style>
      </div>

      <div className={`subsidy-btn-wrap${showBtn ? " subsidy-btn-show" : ""}`}>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full h-11 rounded-2xl bg-primary border-0"
        >
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm">
                <Tag className="w-4 h-4" />
              </div>
              <p className="text-[13px] font-semibold">Check Subsidy Products</p>
            </div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Button>
      </div>

      <SubsidizedPopup
        subsidyGot={SubsidyVal}
        customerId={customerId}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        alreadyAddedIds={subItemIds}
      />
    </>
  )
}

export default ProgressBarCart

export const SubsidyCart = ({ subsidy }: { subsidy: number }) => {
  const [totalSubsidy] = useAtom(SubsidyValue);
  const [usedSubsidy] = useAtom(UsedSubsidy);

  const safeSubsidy = subsidy ?? 0;
  const safeTotal = totalSubsidy ?? 0;
  const safeUsed = usedSubsidy ?? 0;

  const orderSubsidy = safeSubsidy / 100;
  const walletBalance = safeTotal;
  const totalUsed = safeTotal - (safeUsed / 100);

  if (safeSubsidy <= 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200/70 bg-emerald-100/50">
        <Gift className="w-4 h-4 text-emerald-700" />
        <span className="text-sm font-semibold text-emerald-800 tracking-wide">
          Subsidy Breakdown
        </span>
      </div>

      <div className="divide-y divide-emerald-100">
        <Row
          label="Order Subsidy"
          description="On this order"
          value={orderSubsidy}
          icon={<Tag className="w-4 h-4 text-emerald-600" />}
        />

        {safeTotal > 0 && (
          <Row
            label="Total Subsidy"
            description="Gift + Order"
            value={walletBalance}
            icon={<Wallet className="w-4 h-4 text-emerald-600" />}
          />
        )}

        {safeUsed > 0 && (
          <Row
            label="Total left"
            description="Subsidy left"
            value={totalUsed}
            icon={<MinusCircle className="w-4 h-4 text-rose-500" />}
            variant="used"
          />
        )}
      </div>
    </div>
  );
};

const Row = ({
  label,
  description,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  description: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "used";
}) => {
  const isUsed = variant === "used";

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${isUsed ? "bg-rose-50/50" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isUsed ? "bg-rose-100" : "bg-emerald-100"}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-semibold leading-none ${isUsed ? "text-rose-700" : "text-secondary-foreground/80"}`}>
            {label}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-none">
            {description}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold tabular-nums ${isUsed ? "text-rose-600" : "text-emerald-700"}`}>
        CA${value.toFixed(2)}
      </span>
    </div>
  );
};