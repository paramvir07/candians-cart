"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Users,
  CreditCard,
  HelpCircle,
  LogOut,
  ChartSpline,
  PackageOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth/login-logout.actions";

interface NavAvatarMenuProps {
  name: string;
  initials: string;
}

export function NavAvatarMenu({ name, initials }: NavAvatarMenuProps) {
  const router = useRouter();

  
  const handleLogout = async () => {
  const response = await logoutAction();
  if (!response.success) {
    throw new Error("Something went wrong");
  }
  router.push("/customer/login");
};


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background hover:ring-primary/60 transition-all focus:outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}`}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-52 rounded-2xl border border-border/60 shadow-xl shadow-black/10 p-1.5"
      >
        {/* Profile */}
        <DropdownMenuItem
          onClick={() => router.push("/customer/profile")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <User size={15} className="text-muted-foreground shrink-0" />
          Profile
        </DropdownMenuItem>

        {/* Wallet */}
        <DropdownMenuItem
          onClick={() => router.push("/customer/wallet")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <CreditCard size={15} className="text-muted-foreground shrink-0" />
          Wallet
        </DropdownMenuItem>

        {/* Orders */}
        <DropdownMenuItem
          onClick={() => router.push("/customer/orders")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <Users size={15} className="text-muted-foreground shrink-0" />
          Orders
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/customer/budget-packs")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <PackageOpen size={15} className="text-muted-foreground shrink-0" />
          Budget packs
        </DropdownMenuItem>
        {/* Settings
        <DropdownMenuItem
          onClick={() => router.push("/customer/settings")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <Settings size={15} className="text-muted-foreground shrink-0" />
          Settings
        </DropdownMenuItem> */}

        <DropdownMenuItem
          onClick={() => router.push("/customer/analytics")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <ChartSpline size={15} className="text-muted-foreground shrink-0" />
          Analytics
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-border/60" />

        {/* Help */}
        <DropdownMenuItem
          onClick={() => router.push("/customer/help")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <HelpCircle size={15} className="text-muted-foreground shrink-0" />
          Help center
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-red-500 hover:bg-red-50 focus:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} className="shrink-0" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}