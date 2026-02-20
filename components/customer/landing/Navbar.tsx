import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { ProfileDropDown } from "./ProfileDropDown";
import { getUser } from "@/actions/customer/User.action";

const Navbar = async () => {
  const UserData = await getUser();

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
          <Button variant="outline" className="p-2">
            <ShoppingCartIcon className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="p-2">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Wallet + Avatar always visible */}
        <Link href="/customer/wallet">
          <Button variant="default" className="flex items-center gap-1 px-3">
            <Wallet className="w-5 h-5" />
            $200
          </Button>
        </Link>

        <ProfileDropDown userData={UserData} />
      </div>
    </nav>
  );
};

export default Navbar;
