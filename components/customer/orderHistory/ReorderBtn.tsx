"use client"
import { ReOrder } from "@/actions/customer/ProductAndStore/Order.Action"
import { Button } from "@/components/ui/button"
import { Download, RotateCw } from "lucide-react"
import { toast } from "sonner"

const ReorderBtn = ({ OrderId }: { OrderId: string }) => {
  const handleReOrder = async () => {
   const res =  await ReOrder(OrderId);

   if(res?.success){
    toast.success("Item(s) added to cart")
   }
  }

  const handleDownloadInvoice = async () => {
    const res = await fetch(`/api/invoice/${OrderId}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${OrderId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
        onClick={handleDownloadInvoice}
      >
        <Download size={14} />
        <span className="hidden sm:inline text-sm">Invoice</span>
      </Button>

      <Button
        onClick={handleReOrder}
        size="icon"
        className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
      >
        <RotateCw size={14} />
        <span className="hidden sm:inline text-sm">Reorder</span>
      </Button>
    </div>
  )
}

export default ReorderBtn