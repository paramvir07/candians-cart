import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { Search, ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { Customer } from "@/types/customer/customer";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import { NavAvatarMenu } from "./NavMenu";
import {
  getCustomerNotifications,
  getUnreadNotificationCount,
} from "@/actions/common/notification.action";
import { NotificationDropdown } from "../notification/NotificationDropdown";

const Navbar = async () => {
  const [
    customerDataResponse,
    cartCount,
    unreadCountResponse,
    notificationsResponse,
  ] = await Promise.all([
    getCustomerDataAction(),
    getCartItemsCount(),
    getUnreadNotificationCount(),
    getCustomerNotifications(),
  ]);

  const customerData: Customer = customerDataResponse.customerData;
  const unreadCount = unreadCountResponse.count ?? 0;
  const notifications = notificationsResponse.data ?? [];

  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-50 w-screen max-w-[100vw] overflow-hidden bg-background border-b border-border">
      <div className="flex w-full max-w-[100vw] min-w-0 items-center justify-between px-2 min-[360px]:px-3 sm:px-5 h-14 gap-2 sm:gap-4">
        {/* Logo */}
        <div className="shrink-0 flex items-center h-full">
          <Logo variant="icon" />
        </div>

        {/* Search — tablet+ */}
        <Link
          href="/customer/search"
          className="hidden md:block flex-1 max-w-full mx-4"
        >
          <SearchBar />
        </Link>

        {/* Spacer on mobile */}
        <div className="flex-1 min-w-0 md:hidden" />

        {/* Right actions */}
        <div className="flex min-w-0 shrink-0 items-center gap-1 min-[360px]:gap-1.5 sm:gap-2">
          {/* Search — mobile */}
          <Link href="/customer/search" className="md:hidden shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 active:scale-[0.97] transition-all">
              <Search className="w-[16px] h-[16px] text-primary" />
            </div>
          </Link>

          {/* Notifications Dropdown */}
          <div className="shrink-0">
            <NotificationDropdown
              unreadCount={unreadCount}
              notifications={notifications}
            />
          </div>

          {/* Cart */}
          <Link href="/customer/cart" className="shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 active:scale-[0.97] transition-all">
              <ShoppingCartIcon className="w-[16px] h-[16px] text-primary" />
              {(cartCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground border-2 border-background">
                  {(cartCount ?? 0) > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
          </Link>

          {/* Wallet pill */}
          <Link href="/customer/wallet" className="shrink-0">
            <div className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-2 py-0 transition-all hover:bg-secondary/80 active:scale-[0.97] min-[360px]:px-3 sm:gap-2 sm:px-5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-3.5 w-3.5 text-primary-foreground" />
              </div>

              <span className="whitespace-nowrap text-center text-[13px] font-black leading-none tracking-tight text-foreground sm:text-sm">
                $
                {(
                  (customerData.walletBalance +
                    customerData.giftWalletBalance) /
                  100
                ).toFixed(2)}
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-border mx-1" />

          {/* Avatar dropdown */}
          <div className="shrink-0 ml-1 min-[360px]:ml-1.5 sm:ml-0 flex items-center">
            <NavAvatarMenu name={customerData.name} initials={initials} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
