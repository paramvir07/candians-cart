import Navbar from "@/components/customer/landing/Navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

const cartItems = [
  {
    id: 1,
    name: "Organic Whole Milk",
    brand: "By Engro Foods",
    price: 8.49,
    originalPrice: 12.00,
    quantity: 1,
    image: "https://static.vecteezy.com/system/resources/previews/071/766/069/non_2x/a-brown-paper-grocery-bag-packed-with-fresh-food-items-like-lettuce-tomatoes-bread-and-milk-isolated-on-transparent-background-free-png.png",
  },
  {
    id: 2,
    name: "Desi Ghee 1kg",
    brand: "By Nurpur",
    price: 13.64,
    originalPrice: 18.50,
    quantity: 2,
    image: "https://static.vecteezy.com/system/resources/previews/071/766/069/non_2x/a-brown-paper-grocery-bag-packed-with-fresh-food-items-like-lettuce-tomatoes-bread-and-milk-isolated-on-transparent-background-free-png.png",
  },
  {
    id: 3,
    name: "Free Range Brown Eggs",
    brand: "By Farm Fresh",
    price: 6.99,
    originalPrice: 9.00,
    quantity: 1,
    image: "https://static.vecteezy.com/system/resources/previews/071/766/069/non_2x/a-brown-paper-grocery-bag-packed-with-fresh-food-items-like-lettuce-tomatoes-bread-and-milk-isolated-on-transparent-background-free-png.png",
  },
  {
    id: 4,
    name: "Sourdough Bread",
    brand: "By Bakers Inn",
    price: 4.99,
    originalPrice: 6.50,
    quantity: 1,
    image: "https://static.vecteezy.com/system/resources/previews/071/766/069/non_2x/a-brown-paper-grocery-bag-packed-with-fresh-food-items-like-lettuce-tomatoes-bread-and-milk-isolated-on-transparent-background-free-png.png",
  },
]

const page = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="px-5 pt-6 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            My Cart{" "}
            <span className="text-gray-400 font-normal">({cartItems.length})</span>
          </h1>
        </div>

        {/* Items — pb-24 so last item clears the fixed checkout btn */}
        <div className="flex flex-col gap-6 pb-24">
          {cartItems.map((item) => (
            <div key={item.id}>
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={110}
                    height={110}
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold leading-tight">{item.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Counter */}
                <div className="flex flex-col items-center w-10 border border-gray-200 rounded-full overflow-hidden shrink-0 bg-white">
                  <button className="w-full py-1.5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <div className="w-full py-1.5 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-900 leading-none">
                      {String(item.quantity).padStart(2, "0")}
                    </span>
                  </div>
                  <button className="w-full py-1.5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-3 mt-3 ml-1">
                <Button variant="outline" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <Trash2 size={15} />
                  <span>Remove</span>
                </Button>
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