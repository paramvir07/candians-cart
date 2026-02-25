import { DecrementItem, getCart, IncrementItem, RemoveItem } from "@/actions/customer/ProductAndStore/Cart.Action"
import Navbar from "@/components/customer/landing/Navbar"
import { EmptyCart } from "@/components/customer/products/EmptyCart"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface IProductImage {
  url?: string
  fileId: string
  _id: string
}

interface IProduct {
  _id: string
  storeId: string
  name: string
  description: string
  category: string
  markup: number
  tax: number
  price: number
  stock: boolean
  images?: IProductImage[]
  createdAt: string
  updatedAt: string
}

interface ICartItem {
  productId: IProduct
  storeId: string
  quantity: number
  createdAt: string
  updatedAt: string
}

const page = async () => {
  const CartItems = await getCart() as ICartItem[] | null

  if (!CartItems || CartItems.length === 0) {
    return (
      <div>
        <EmptyCart/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="px-5 pt-6 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={'/'}>
          <Button className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            My Cart{" "}
            <span className="text-gray-400 font-normal">({CartItems.length})</span>
          </h1>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-6 pb-24">
          {CartItems.map((item: ICartItem) => (
            <div key={item.productId._id}>
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <Image
                    src={item.productId.images?.[0]?.url ?? "https://i.pinimg.com/736x/0d/aa/29/0daa294d95b91e53007b5e472ad6a492.jpg"}
                    alt={item.productId.name}
                    width={110}
                    height={110}
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold leading-tight">{item.productId.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{item.productId.category}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold">$ {((item.productId.price/100)*item.quantity).toFixed(2)}</span>
                  </div>
                </div>

                {/* Counter */}
                <div className="flex flex-col items-center w-10 border border-gray-200 rounded-full overflow-hidden shrink-0 bg-white">
                  <form action={DecrementItem} className="w-full py-1.5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input type="hidden" name="productId" value={item.productId._id.toString()}/>
                  <button type="submit" >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  </form>

                  <div className="w-full py-1.5 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-900 leading-none">
                      {String(item.quantity).padStart(2, "0")}
                    </span>
                  </div>
                    <form action={IncrementItem} className="w-full py-1.5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input type="hidden" name="productId" value={item.productId._id.toString()}/>
                  <button type="submit" >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                  </form>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-3 mt-3 ml-1">

                <form action={RemoveItem} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <input type="hidden" name="productId" value={item.productId._id.toString()}/>
                 <Button variant="outline">
                  <Trash2 size={15} />
                  <span>Remove</span>
                </Button>
                  </form>
                
              </div>

              {/* Divider */}
              <div className="mt-4 border-b border-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-100">
        <div className="max-w-md mx-auto">
          <Button className="w-full p-5">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default page