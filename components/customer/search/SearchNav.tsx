import Logo from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"

const SearchNav = () => {

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="flex items-center p-3 w-full max-w-7xl mx-auto space-x-3">

        {/* Mobile Back Button */}
        <Link href={"/customer"}>        
        <Button
          variant="ghost"
          className="shrink-0 sm:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        </Link>

        {/* Logo (hidden on mobile) */}
        <div className="shrink-0 hidden sm:flex">
          <Logo />
        </div>

        {/* Search input + button */}
        <div className="flex flex-1">
          <Input
            type="text"
            placeholder="Search..."
            className="flex-1 rounded-r-none"
          />
          <Button
            variant="outline"
            className="rounded-l-none px-4"
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            className="ml-2 px-4 sm:inline-flex"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>

      </div>
    </div>
  )
}

export default SearchNav
    