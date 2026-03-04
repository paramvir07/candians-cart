"use client"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { SubsidizedPopup } from "./SubsidizedPopup"
import { useAtom } from "jotai"
import { SubsidyValue } from "@/atoms/customer/CartAtom"
import { Wallet } from "lucide-react"

const ProgressBarCart = ({ total, customerId }: { total: number, customerId? :string }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const clearedMilestonesRef = useRef<Set<number>>(new Set())
  const [SubsidyVal, setSubsidyVal] = useAtom(SubsidyValue)
  let Subsidy = 0;

  const getFibBracketFrom21 = (value: number) => {
    let a = 13
    let b = 21
    while (b < value) {
      const next = a + b
      a = b
      b = next
    }
    return { prev: a, current: b }
  }

  const amount = total / 100
  const { prev, current } = getFibBracketFrom21(amount)

  const progressValue =
    current === prev
      ? 100
      : Math.min(((amount - prev) / (current - prev)) * 100, 100)

  useEffect(() => {
    if (amount > prev && prev >= 21 && !clearedMilestonesRef.current.has(prev)) {
      clearedMilestonesRef.current.add(prev)
      setDialogOpen(true)
    }
  }, [amount, prev])

  clearedMilestonesRef.current.forEach((milestone)=>{
    Subsidy = (milestone*0.15)
  })
  setSubsidyVal(Subsidy)
  return (
    <>
      <div className="flex items-center w-full gap-4">
        <Progress value={progressValue} className="w-full" />
        <p className="text-sm font-semibold tabular-nums whitespace-nowrap text-gray-900">
          ${current}
        </p>
      </div>
      <SubsidizedPopup
        subsidyGot={Subsidy}
        customerId={customerId}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

export default ProgressBarCart

export const SubsidyCart = ()=>{
    const [SubsidyVal] = useAtom(SubsidyValue)

          return(
          <div className="relative flex justify-between items-center px-4 py-3 rounded-2xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 opacity-10 rounded-2xl" />
            <div className="absolute inset-0 border border-green-300/40 rounded-2xl" />

            {/* Decorative blobs */}
            <div className="absolute -top-3 -left-3 w-12 h-12 bg-green-400/20 rounded-full blur-md" />
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-400/20 rounded-full blur-md" />

            <div className="relative flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-green-700 leading-none">Subsidy</p>
              </div>
            </div>

            <div className="relative flex items-center gap-1">
              <span className="text-[17px] font-extrabold text-green-600 tabular-nums tracking-tight">
                CA${SubsidyVal.toFixed(2)}
              </span>
            </div>
          </div>
          )
        }
