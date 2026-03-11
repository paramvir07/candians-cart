"use client"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { SubsidizedPopup } from "./SubsidizedPopup"
import { useAtom } from "jotai"
import { SubsidyValue } from "@/atoms/customer/CartAtom"
import { Wallet, Tag, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClearAllSubsidyItems, updateCartSubsidy } from "@/actions/customer/SubsidyItems.Action"

const getFibBracketFrom21 = (value: number) => {
  let a = 13, b = 21
  while (b < value) { const next = a + b; a = b; b = next }
  return { prev: a, current: b }
}

const ProgressBarCart = ({ total, customerId, giftWalletBalance }: { total: number, customerId?: string, giftWalletBalance?: number }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  const [SubsidyVal, setSubsidyVal] = useAtom(SubsidyValue)

  const amount = total / 100
  const giftBalance = (giftWalletBalance ?? 0) / 100
  const { prev, current } = getFibBracketFrom21(amount)
  const subsidy = amount >= 21 ? prev * 0.15 : 0
  const progressValue = current === prev ? 100 : Math.min(((amount - prev) / (current - prev)) * 100, 100)

  const lastMilestoneRef = useRef<number | null>(null)
  const lastSubsidyRef = useRef<number | null>(null)

  useEffect(() => {
    setSubsidyVal(subsidy + giftBalance)

    if (lastSubsidyRef.current === subsidy) return
    lastSubsidyRef.current = subsidy

    if (amount < 21) {
      setShowBtn(false)
      setDialogOpen(false)
      lastMilestoneRef.current = null
      ClearAllSubsidyItems()
      return
    }

    updateCartSubsidy(subsidy * 100)

    if (lastMilestoneRef.current !== prev) {
      lastMilestoneRef.current = prev
      setShowBtn(true)
    }
  }, [subsidy, amount, prev])

  return (
    <>
      <div className="flex items-center w-full gap-4">
        <Progress value={progressValue} className="w-full" />
        <p className="text-sm font-semibold tabular-nums whitespace-nowrap text-gray-900">
          ${current}
        </p>
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
              <p className="text-[13px] font-semibold">
                Check Subsidy Products
              </p>
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

export const SubsidyCart = () => {
  const [SubsidyVal] = useAtom(SubsidyValue)

  if (SubsidyVal <= 0) return null

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1.5">
        <Wallet className="w-3.5 h-3.5 text-emerald-500" />
        <div>
          <span className="text-gray-500">Gift Wallet</span>
          <p className="text-[10px] text-emerald-500 leading-none mt-0.5">Subsidy included</p>
        </div>
      </div>
      <span className="font-medium text-emerald-600 tabular-nums">
        CA${SubsidyVal.toFixed(2)}
      </span>
    </div>
  )
}