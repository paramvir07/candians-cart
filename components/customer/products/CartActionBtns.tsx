"use client"

import {
  DecrementSubsidyItem,
  IncrementSubsidyItem,
  movetoSubsidy,
  RemoveSubsidyItem,
} from "@/actions/customer/SubsidyItems.Action"
import { SubsidyValue } from "@/atoms/customer/CartAtom"
import { Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { Minus, Plus, Trash2 } from "lucide-react"

const fmt = (cents: number) => (cents / 100).toFixed(2)

const CartActionBtns = ({
  quantity,
  beforeSubsidy,
  subsidy,
  productId,
  variant = "desktop",
}: {
  quantity: number
  beforeSubsidy: number
  subsidy: number
  productId: string
  variant?: "mobile" | "desktop"
}) => {

  const afterSubsidy = Math.max((beforeSubsidy * quantity) - subsidy, 0)

  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-between mt-2.5">
        <button
          type="button"
          onClick={() => RemoveSubsidyItem(productId)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
          <span>Remove</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => DecrementSubsidyItem(productId)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Minus size={12} strokeWidth={2} />
          </button>

          <span className="text-sm font-semibold text-gray-900 w-5 text-center tabular-nums">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => IncrementSubsidyItem(productId)}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Plus size={12} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          type="button"
          size="icon"
          onClick={() => DecrementSubsidyItem(productId)}
          className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          <Minus size={13} strokeWidth={2} />
        </Button>

        <span className="text-sm font-semibold text-gray-900 w-6 text-center tabular-nums">
          {quantity}
        </span>

        <Button
          type="button"
          size="icon"
          onClick={() => IncrementSubsidyItem(productId)}
          className="w-8 h-8 rounded-full bg-primary hover:opacity-80 transition-opacity"
        >
          <Plus size={13} strokeWidth={2} className="text-white" />
        </Button>
      </div>

      <div className="w-24 text-right">
        <p className="text-sm font-bold text-gray-900 tabular-nums">
          CA${fmt(afterSubsidy)}
        </p>
        <p className="text-xs text-gray-400 line-through tabular-nums mt-0.5">
          CA${fmt(beforeSubsidy * quantity)}
        </p>
      </div>

      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => RemoveSubsidyItem(productId)}
        className="text-gray-300 hover:text-red-400 transition-colors ml-1"
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </Button>
    </>
  )
}

export default CartActionBtns


export const AddtoSubsidyBtn = ({ ProductId }: { ProductId: string }) => {
  return (
    <button
      onClick={() => movetoSubsidy(ProductId)}
      className="cursor-pointer shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all px-2 py-0.5 rounded-md"
    >
      Use Subsidy
    </button>
  )
}