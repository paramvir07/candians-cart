"use client"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { SubsidizedPopup } from "./SubsidizedPopup"
import { useAtom } from "jotai"
import { SubsidyValue } from "@/atoms/customer/CartAtom"
import { Wallet, Tag, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClearAllSubsidyItems, updateCartSubsidy } from "@/actions/customer/SubsidyItems.Action"
import { getFibBracketFrom21 } from "@/lib/FibBracket"
 


 
const ProgressBarCart = ({ total, customerId, giftWalletBalance,SubsidyonOrder }: {
  SubsidyonOrder:number
  Totalsubsidy:number
  totalMarkup:number
  total: number
  customerId?: string
  giftWalletBalance?: number
}) => {

  const [dialogOpen, setDialogOpen] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  const [SubsidyVal, setSubsidyVal] = useAtom(SubsidyValue)
 
  const amount = total / 100
  const giftBalance = (giftWalletBalance ?? 0) / 100
  const { prev, current, mid } = getFibBracketFrom21(amount)
  const progressValue = current === prev ? 100 : Math.min(((amount - prev) / (current - prev)) * 100, 100)
 
  const lastMilestoneRef  = useRef<number | null>(null)
  const lastSubsidyRef    = useRef<number | null>(null)
  const prevAmountRef     = useRef<number | null>(null)
  useEffect(() => {
    setSubsidyVal((SubsidyonOrder/100)+giftBalance)

    const prevAmount = prevAmountRef.current
 
    if (amount < 21 && prevAmount !== null && prevAmount >= 21) {
      setShowBtn(false)
      setDialogOpen(false)
      lastMilestoneRef.current = null
      lastSubsidyRef.current = null
      ClearAllSubsidyItems(customerId)
    }
 
    prevAmountRef.current = amount 
 
    if (amount < 21) return
 
    if (lastSubsidyRef.current === SubsidyonOrder) return
    lastSubsidyRef.current = SubsidyonOrder
 
    updateCartSubsidy((SubsidyonOrder), customerId)
 
    if (lastMilestoneRef.current !== prev) {
      lastMilestoneRef.current = prev
      setShowBtn(true)
    }
    return () => {
    prevAmountRef.current = null
    lastSubsidyRef.current = null
    lastMilestoneRef.current = null
  }
  }, [SubsidyonOrder, amount, prev, giftBalance])


  return (
    <>
      <div className="relative w-full">
        {/* Labels row — prev and current only in flex, mid is absolute */}
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

        {/* Track */}
        <div className="relative h-3.5 w-full rounded-full overflow-hidden"
          style={{ background: "var(--secondary)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" }}
        >
          {/* Tick texture on track */}
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 11px, oklch(0.6271 0.1699 149.2138 / 0.15) 11px, oklch(0.6271 0.1699 149.2138 / 0.15) 12px)" }}
          />

          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressValue}%`,
              background: "linear-gradient(90deg, oklch(0.5271 0.1699 149.2138), oklch(0.6271 0.1699 149.2138) 60%, oklch(0.7227 0.192 149.5793))",
              boxShadow: "0 0 14px oklch(0.6271 0.1699 149.2138 / 0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            {/* Gloss */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
            {/* Shimmer sweep */}
            <div className="absolute top-0 bottom-0 w-10 opacity-0"
              style={{
                right: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                animation: "cartShimmer 2.4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Mid divider */}
          {mid && (
            <div
              className="absolute top-0 bottom-0 w-px z-10"
              style={{
                left: `${((mid - prev) / (current - prev)) * 100}%`,
                background: "oklch(0.6271 0.1699 149.2138 / 0.5)",
              }}
            >
              {/* Top gem */}
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "var(--primary)" }} />
              {/* Bottom gem */}
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "var(--primary)" }} />
            </div>
          )}
        </div>

        {/* Subsidy nudge pill */}
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
        `}</style>
      </div>
 
      {showBtn && (
        <Button
          onClick={() => setDialogOpen(true)}
          className="mt-3 w-full h-11 rounded-2xl bg-primary border-0"
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
      )}
 
      <SubsidizedPopup
        subsidyGot={SubsidyVal}
        customerId={customerId}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
 
export default ProgressBarCart
 
export const SubsidyCart = ({ subsidy }: { subsidy: number }) => {
  if (!subsidy || subsidy <= 0) return null;

  return (
    <div className="flex items-center justify-between text-sm rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div>
          <span className="font-medium text-emerald-800 text-xs">Order Subsidy</span>
          <p className="text-[10px] text-emerald-500 leading-none mt-0.5">Applied to your total</p>
        </div>
      </div>
      <span className="font-semibold text-emerald-600 tabular-nums">
        CA${(subsidy / 100).toFixed(2)}
      </span>
    </div>
  )
}
 