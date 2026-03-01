import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { Customer } from "@/types/Customer/customer";

const Navbar = async () => {
  const customerDataResponse = await getCustomerDataAction();
  const customerData: Customer = customerDataResponse.customerData;

  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <nav className="flex items-center justify-between px-4 py-4 shadow-sm bg-white">
      {/* Logo */}
      <Logo />

      {/* Search */}
      <Link href="/customer/search" className="flex-1 mx-6">
        <SearchBar />
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Cart + Bell only on medium+ screens */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={"/customer/cart"}>
            <Button variant="outline" className="p-2">
              <ShoppingCartIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Wallet + Avatar always visible */}
        <Link href="/customer/wallet">
          <Button variant="default" className="flex items-center gap-1 px-3">
            <Wallet className="w-5 h-5" />${customerData.walletBalance.toFixed(2)}
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
