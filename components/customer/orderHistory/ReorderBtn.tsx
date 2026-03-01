"use client"
import { ReOrder } from "@/actions/customer/ProductAndStore/Order.Action"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"

const ReorderBtn = ({OrderId}:{OrderId:string}) => {
  const handleReOrder = async () => {
     await ReOrder(OrderId)
  }

  return (
    <Button onClick={handleReOrder} size="icon" className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0">
      <RotateCw size={14} />
      <span className="hidden sm:inline text-sm">Reorder</span>
    </Button>
  )
}

export default ReorderBtn