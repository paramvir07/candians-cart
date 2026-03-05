"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Package,
  ShoppingBag,
  ShoppingCartIcon,
  Wallet,
} from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import LogoutButton from "../shared/LogoutButton";

type CustomerData = {
  customerData?: {
    id?: string;
    name?: string;
    cartCount?: number;
  };
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  showBadge?: boolean;
};

const CashierSidebar = ({ customerData }: CustomerData) => {
  const pathname = usePathname();

  const customerId = customerData?.id;

  const customerNav: NavItem[] = customerId
    ? [
        {
          label: "Customer Cart",
          href: `/cashier/customer/${customerId}/cart`,
          icon: ShoppingCartIcon,
          showBadge: true,
        },
        {
          label: "Customer Orders",
          href: `/cashier/customer/${customerId}/orders`,
          icon: Package,
        },
        {
          label: "Customer Products",
          href: `/cashier/customer/${customerId}/products`,
          icon: ShoppingBag,
        },
        {
          label: "Customer Wallet",
          href: `/cashier/customer/${customerId}/wallet`,
          icon: Wallet,
      },
        
      ]
    : [];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const IconButton = ({
    href,
    label,
    icon: Icon,
    children,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    children?: React.ReactNode;
  }) => {
    const active = isActive(href);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className={[
              "relative h-11 w-11 rounded-2xl transition-all",
              "hover:bg-background/70 hover:shadow-sm",
              "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              active
                ? "bg-background/80 shadow-sm ring-1 ring-primary/25"
                : "bg-transparent",
            ].join(" ")}
          >
            <Link href={href} aria-label={label} title={label}>
              <Icon className={active ? "opacity-100" : "opacity-90"} />
              {children}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const CartBadge = () => {
    const count = customerData?.cartCount ?? 0;
    if (count <= 0) return null;

    return (
      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={[
          "hidden md:flex fixed top-4 bottom-4 left-4 z-40",
          "w-[74px] flex-col items-center justify-between",
          "rounded-[28px] border border-primary/10",
          "bg-gradient-to-b from-[#e8f6ed]/90 to-[#e8f6ed]/60",
          "backdrop-blur supports-[backdrop-filter]:bg-[#e8f6ed]/60",
          "shadow-lg shadow-black/5",
          "py-4",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-3 px-2">
          {/* Dashboard */}
          <IconButton href="/cashier" label="Dashboard" icon={HomeIcon} />

          {customerId && (
            <>
              <Separator className="my-2 w-10 bg-primary/30" />

              {/* Customer Avatar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/cashier/customer/${customerId}`}
                    className={[
                      "grid place-items-center rounded-2xl p-1 transition",
                      "hover:bg-background/60",
                    ].join(" ")}
                    aria-label="Customer Profile"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/25 ring-offset-2 ring-offset-transparent shadow-sm">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                          customerData?.name ?? "User",
                        )}`}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Customer Profile</p>
                </TooltipContent>
              </Tooltip>

              {/* Customer Actions */}
              {customerNav.map((item) => (
                <IconButton
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                >
                  {item.showBadge ? <CartBadge /> : null}
                </IconButton>
              ))}

              <Separator className="my-2 w-10 bg-primary/30" />
            </>
          )}
        </div>

        {/* Cashier Profile + Logout */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-2xl hover:bg-background/70"
              >
                <Link href="/cashier/profile" aria-label="Cashier Profile">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Cashier Profile</p>
            </TooltipContent>
          </Tooltip>

          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav
        className={[
          "fixed bottom-3 left-3 right-3 z-50 md:hidden",
          "rounded-full border border-primary/10",
          "bg-gradient-to-r from-[#e8f6ed]/90 to-[#e8f6ed]/60",
          "backdrop-blur supports-[backdrop-filter]:bg-[#e8f6ed]/70",
          "shadow-lg shadow-black/5",
          "px-2 py-2",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          {/* Always show Dashboard */}
          <Button
            asChild
            size="icon"
            variant="ghost"
            className={[
              "h-11 w-11 rounded-full",
              isActive("/cashier")
                ? "bg-background/80 ring-1 ring-primary/25"
                : "",
            ].join(" ")}
          >
            <Link href="/cashier" aria-label="Dashboard">
              <HomeIcon />
            </Link>
          </Button>

          {/* If customer selected, show quick actions */}
          {customerId ? (
            <div className="flex items-center gap-1">
              {customerNav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    asChild
                    size="icon"
                    variant="ghost"
                    className={[
                      "relative h-11 w-11 rounded-full transition",
                      active
                        ? "bg-background/80 ring-1 ring-primary/25"
                        : "hover:bg-background/70",
                    ].join(" ")}
                  >
                    <Link href={item.href} aria-label={item.label}>
                      <Icon />
                      {item.showBadge ? <CartBadge /> : null}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : (
            // If no customer, show profile in the middle
            <Button asChild size="icon" variant="ghost" className="h-11 w-11">
              <Link href="/cashier/profile" aria-label="Cashier Profile">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          )}

          <LogoutButton />
        </div>
      </nav>
    </>
  );
};

export default CashierSidebar;
