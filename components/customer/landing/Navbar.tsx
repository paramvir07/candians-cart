import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { Customer } from "@/types/customer/customer";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";

const Navbar = async () => {
  const [customerDataResponse, cartCount] = await Promise.all([
    getCustomerDataAction(),
    getCartItemsCount(),
  ]);

  const customerData: Customer = customerDataResponse.customerData;
  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="flex items-center justify-between px-4 py-4 shadow-sm bg-white sticky top-0 z-50">
      {/* Logo */}
      <Logo />

      {/* Search — Hidden on mobile, visible on md (tablet) and up */}
      <Link href="/customer/search" className="hidden md:block flex-1 mx-6">
        <SearchBar />
      </Link>

      {/* Actions (Wallet & Profile pushed to the right on mobile) */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        {/* Cart only on medium+ screens */}
        <div className="items-center gap-3">
          <Link href="/customer/cart">
            <Button variant="outline" className="relative p-2">
              <ShoppingCartIcon className="w-5 h-5" />
              {(cartCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(cartCount ?? 0) > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Wallet + Avatar ALWAYS visible */}
        <Link href="/customer/wallet">
          <Button variant="default" className="flex items-center gap-1 px-3">
            <Wallet className="w-5 h-5" />
            {/* Optional: hide the text balance on super small screens if it gets tight, otherwise leave as is */}
            <span>${customerData.walletBalance.toFixed(2)}</span>
          </Button>
        </Link>

        <Link href="/customer/profile">
          <Avatar className="relative h-8 w-8 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-2xl">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customerData.name)}`}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl lg:text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
