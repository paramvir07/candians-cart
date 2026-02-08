'use client'

import { BarChart, HomeIcon, Store, Users2 } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import Link from "next/link"

const AdminSidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-4 bottom-4 left-3 w-16 flex-col items-center rounded-full bg-white py-4 z-40">
        <div className="flex flex-col gap-4">

          {/* Dashboard */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/admin">
                  <HomeIcon />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>

          {/* Analytics */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/admin/analytics">
                  <BarChart />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Analytics</p>
            </TooltipContent>
          </Tooltip>

          {/* Users */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/admin/users">
                  <Users2 />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Users</p>
            </TooltipContent>
          </Tooltip>

          {/* Shops */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/admin/shops">
                  <Store />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Shops</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Profile */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost">
                <Link href="/admin/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around bg-white py-2 m-3 rounded-full shadow-xl">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin">
            <HomeIcon />
          </Link>
        </Button>

        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/analytics">
            <BarChart />
          </Link>
        </Button>

        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/users">
            <Users2 />
          </Link>
        </Button>

        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/shops">
            <Store />
          </Link>
        </Button>

        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
        </Button>
      </nav>
    </>
  )
}

export default AdminSidebar
