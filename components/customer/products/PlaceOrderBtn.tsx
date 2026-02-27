"use client"
import { PlaceOrder } from '@/actions/customer/ProductAndStore/Cart.Action'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const PlaceOrderBtn = () => {
  return (
                      <Button onClick={()=>{PlaceOrder()}} className="w-full mt-5 py-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                        Place Order
                        <ArrowRight className="w-4 h-4" />
                      </Button>
  )
}

export default PlaceOrderBtn