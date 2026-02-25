import { getCart } from "@/actions/customer/ProductAndStore/Cart.Action"
import Navbar from "@/components/customer/landing/Navbar"
import { EmptyCart } from "@/components/customer/products/EmptyCart"
import { ICartItem } from "@/types/Customer/CustomerCart"
import { ChevronLeft, Wallet, Shield, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// PKR to CAD (approx rate)
const toCad = (pkr: number) => (pkr * 0.0051).toFixed(2)

const page = async () => {
  const CartItems = await getCart() as ICartItem[] | null

  if (!CartItems || CartItems.length === 0) {
    return <EmptyCart />
  }

  const subtotal = CartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0)
  const delivery = 299
  const tax = CartItems.reduce((sum, item) => sum + item.productId.price * item.productId.tax * item.quantity, 0)
  const total = subtotal + delivery + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── MOBILE ── */}
      <div className="md:hidden">

        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm px-4 pt-4 pb-3 flex items-center gap-3">
          <Link href="/customer/cart">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-lg font-bold">Review Order</h1>
        </div>

        <div className="px-4 pb-44 flex flex-col gap-3">

          {/* Items */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                {CartItems.length} {CartItems.length === 1 ? "item" : "items"}
              </p>
            </div>
            {CartItems.map((item, i) => (
              <div
                key={item.productId._id}
                className={`flex items-center gap-3 px-4 py-3 ${i !== CartItems.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.productId.images?.[0]?.url ?? "https://i.pinimg.com/736x/0d/aa/29/0daa294d95b91e53007b5e472ad6a492.jpg"}
                    alt={item.productId.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.productId.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.productId.category} · qty {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  CA${toCad(item.productId.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Wallet */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pay with Wallet</p>
                <p className="text-xs text-gray-400">Balance: CA$0.00</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
              Top Up
            </button>
          </div>

          {/* Bill */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-3">Bill Details</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">CA${toCad(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="text-gray-900 font-medium">CA${toCad(delivery)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 font-medium">CA${toCad(tax)}</span>
              </div>
              <div className="h-px bg-gray-100 my-0.5" />
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">CA${toCad(total)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Fixed CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-4 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900">CA${toCad(total)}</p>
            </div>
            <Button className="flex items-center gap-2 px-6 py-5 rounded-xl text-sm font-semibold">
              Place Order
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-gray-300" />
            <p className="text-[11px] text-gray-400">Secured checkout</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block max-w-4xl mx-auto px-8 py-10">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/customer/cart">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Review Order</h1>
        </div>

        <div className="flex gap-6 items-start">

          {/* Left */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  {CartItems.length} {CartItems.length === 1 ? "item" : "items"}
                </p>
              </div>
              {CartItems.map((item, i) => (
                <div
                  key={item.productId._id}
                  className={`flex items-center gap-4 px-6 py-4 ${i !== CartItems.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                    src={item.productId.images?.[0]?.url ?? "https://i.pinimg.com/736x/0d/aa/29/0daa294d95b91e53007b5e472ad6a492.jpg"}
                      alt={item.productId.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.productId.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.productId.category} · qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    CA${toCad(item.productId.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Wallet */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pay with Wallet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Current balance: CA$0.00</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                Top Up Wallet
              </button>
            </div>

          </div>

          {/* Right — summary */}
          <div className="w-72 shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-4">Order Total</p>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">CA${toCad(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium text-gray-900">CA${toCad(delivery)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-gray-900">CA${toCad(tax)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">CA${toCad(total)}</span>
                </div>
              </div>

              <Button className="w-full mt-5 py-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                Place Order
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield className="w-3 h-3 text-gray-300" />
                <p className="text-xs text-gray-400">Secured checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page