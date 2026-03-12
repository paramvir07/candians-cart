import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { Customer } from "@/types/customer/customer";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import { fmtShort } from "@/lib/fomatPrice";

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
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between px-5 h-14 gap-4">

        {/* Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Search — tablet+ */}
        <Link href="/customer/search" className="hidden md:block flex-1 max-w-sm mx-4">
          <SearchBar />
        </Link>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Cart */}
          <Link href="/customer/cart">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ShoppingCartIcon className="w-[18px] h-[18px]" />
              {(cartCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {(cartCount ?? 0) > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </Link>

          {/* Wallet pill — orange CTA style like "Get full access" */}
          <Link href="/customer/wallet">
            <div className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-sm shadow-primary/25">
              <Wallet className="w-3.5 h-3.5" />
              <span>{fmtShort(customerData.walletBalance)}</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Avatar */}
          <Link href="/customer/profile">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-1 ring-offset-background">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customerData.name)}`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;