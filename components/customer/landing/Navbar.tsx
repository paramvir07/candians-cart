import Logo from "@/components/shared/Logo";
import SearchBar from "./searchBar";
import { ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { Customer } from "@/types/customer/customer";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import { NavAvatarMenu } from "./NavMenu";
import { getCustomerNotifications, getUnreadNotificationCount } from "@/actions/common/notification.action";
import { NotificationDropdown } from "../notification/NotificationDropdown";

// NEW IMPORTS
// import { getCustomerNotifications, getUnreadNotificationCount } from "@/actions/notification"; // Adjust path
// import { NotificationDropdown } from "./NotificationDropdown"; 

const Navbar = async () => {
  // Add the notification fetches to your Promise.all
  const [
    customerDataResponse, 
    cartCount,
    unreadCountResponse,
    notificationsResponse
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
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between px-5 h-14 gap-4">
        
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
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

    {/* Notifications Dropdown (Replaced Link block) */}
          <NotificationDropdown 
            unreadCount={unreadCount} 
            notifications={notifications} 
          />          
          
          {/* Cart */}
          <Link href="/customer/cart">
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
          <Link href="/customer/wallet">
            <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-5 py-1.5 hover:bg-secondary/80 active:scale-[0.97] transition-all">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-primary font-semibold uppercase tracking-wide">
                  Balance
                </span>
                <span className="text-sm font-black text-foreground tracking-tight mt-0.5">
                  ${(customerData.walletBalance / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          


          {/* Avatar dropdown */}
          <NavAvatarMenu name={customerData.name} initials={initials} />

          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;