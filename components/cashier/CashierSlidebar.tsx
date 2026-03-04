"use client";

import { HomeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import LogoutButton from "../shared/LogoutButton";

const CashierSidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-4 bottom-4 left-3 w-16 flex-col items-center rounded-full bg-[#e8f6ed] py-4 z-40">
        <div className="flex flex-col gap-4">
          {/* Dashboard */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/cashier">
                  <HomeIcon />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Profile */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                {/* <Link href="/cashier/profile"> */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {/* </Link> */}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <LogoutButton />
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around bg-[#e8f6ed] py-2 m-3 mt-5 rounded-full shadow-xl">
        <Button asChild size="icon" variant="ghost">
          <Link href="/cashier">
            <HomeIcon />
          </Link>
        </Button>

        <Button asChild size="icon" variant="ghost">
          {/* <Link href="/cashier/profile"> */}
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {/* </Link> */}
        </Button>
        <LogoutButton />
      </nav>
    </>
  );
};

export default CashierSidebar;
