import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarDays, Search, SlidersHorizontal } from "lucide-react"

const UserList = () => {
  return (
    <div>
    <div className="flex items-center justify-between border border-gray-300 p-3">

          <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">User List</h1>
          <Badge>1240 users</Badge>
          </div>


            <div className="flex items-center justify-end gap-2">

                <div className="relative w-72 shadow-2xl rounded-xl bg-accent/70">
                  <Search className="absolute left-3 top-1/2  -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for user"
                    className="pl-10 pr-3 rounded-xl"
                  />
                </div>

                <Button variant='secondary' className="shadow-2xl">
                   <CalendarDays className="w-4 h-4" /> Date
                </Button>
                <Button variant='secondary' className="shadow-2xl">
                    <SlidersHorizontal className="w-4 h-4"/> Filter
                </Button>
            </div>      
    </div>

    <div>
      
    </div>
    </div>
  )
}

export default UserList