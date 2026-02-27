"use client"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PartyPopper, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const ProgressBarCart = ({ total }: { total: number }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const clearedMilestonesRef = useRef<Set<number>>(new Set())

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
    // only fire when amount has strictly surpassed a milestone (not just hit it)
    // and we haven't already shown the popup for this milestone
    if (amount > prev && prev >= 21 && !clearedMilestonesRef.current.has(prev)) {
      clearedMilestonesRef.current.add(prev)
      setDialogOpen(true)
    }
  }, [amount, prev])

  return (
    <>
      <div className="flex items-center w-full gap-4">
        <Progress value={progressValue} className="w-full" />
        {/* just a label, no click handler */}
        <p className="text-sm font-semibold tabular-nums whitespace-nowrap text-gray-900">
          ${current}
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          <div className="px-6 pt-5 pb-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <PartyPopper size={15} className="text-emerald-500" />
                </div>
                <DialogTitle className="text-base font-bold text-gray-950">
                  Milestone reached!
                </DialogTitle>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">
                You've surpassed the{" "}
                <span className="font-semibold text-gray-700">${prev}</span>{" "}
                milestone. You're eligible for a reward on this order.
              </p>
            </DialogHeader>

            <div className="mt-5 rounded-xl bg-gray-950 px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none mb-1">Your reward</p>
                <p className="text-sm font-bold text-white">Free delivery on this order</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Progress value={100} className="flex-1 h-1.5" />
              <span className="text-xs font-semibold text-emerald-500 tabular-nums whitespace-nowrap">
                ${amount.toFixed(2)} / ${prev}
              </span>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl text-sm" onClick={() => setDialogOpen(false)}>
                Maybe later
              </Button>
              <Button className="flex-1 rounded-xl text-sm font-semibold" onClick={() => setDialogOpen(false)}>
                Claim reward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProgressBarCart