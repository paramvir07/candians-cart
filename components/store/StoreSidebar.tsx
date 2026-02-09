import { BarChart, HomeIcon, Store, Users2, PackageCheck } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import Link from "next/link"

const StoreSidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-[calc(100vh)] w-16 flex-col items-center rounded-full bg-white py-4 mt-4 ml-3">

        <div className="flex flex-col gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
               <Link href="/store/">
              <Button size="icon" variant='ghost'>
                <HomeIcon />
              </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <BarChart />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Analytics</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Users2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Users</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/store/products">
              <Button size="icon" variant="ghost">
                <Store />
              </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Products</p>
            </TooltipContent>
          </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <PackageCheck />
                    </Button>
                </TooltipTrigger>
            <TooltipContent side="right">
              <p>Orders</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Avatar */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around bg-accent py-2 m-3 rounded-full">
        <Button size="icon" variant="ghost">
          <HomeIcon />
        </Button>
        <Button size="icon" variant="ghost">
          <BarChart />
        </Button>
        <Button size="icon" variant="ghost">
          <Users2 />
        </Button>
        <Button size="icon" variant="ghost">
          <Store />
        </Button>
        <Button size="icon" variant="ghost">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </nav>
    </>
  )
}

export default StoreSidebar
