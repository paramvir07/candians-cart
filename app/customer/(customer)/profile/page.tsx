import Navbar from "@/components/customer/landing/Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/auth"
import { ChevronLeft, Edit, QrCode, Settings, Store } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

const page = async() => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/customer/login');

  const role = session.user.role === "customer";
  return (
    <div>
      <Navbar/>
      <div className="p-3">
        {/* Action Btn */}
        <div className="flex items-center justify-between pb-5">
          <Button variant="outline" className="w-12 h-12 rounded-full">
          <ChevronLeft />
          </Button>

          <Button variant="outline" className="w-12 h-12 rounded-full">
            <Settings/>
          </Button>
        </div>

          <div className="flex items-center gap-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-xl font-semibold">
                  {session.user.name
                    ?.toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </h1>              
                <p className="text-xs text-gray-700">2750 Fuller Street Abbotsford, CA</p>
            </div>
          </div>

          <div className="flex mt-5 gap-5">
            <Button className="flex-1 rounded-full p-5">
              QR Code <QrCode className="ml-2" />
            </Button>

            <Button asChild className="flex-1 rounded-full p-5">
              <Link href="/customer/profile/edit">
                Edit Profile <Edit className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 mt-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-tight">Sabzi Mandi</p>
                <p className="text-xs text-gray-400 mt-0.5">3473 Fuller Street, Abbotsford, CA</p>
              </div>
            </div>
            <span className="text-xs font-medium text-white bg-primary px-2.5 py-1 rounded-full">
              Opened
            </span>
          </div>

          <div>
            
          </div>
      </div>
    </div>
  )
}

export default page