import { Button } from "@/components/ui/button"
import { CalendarDays, FolderUp, SlidersHorizontal } from "lucide-react"

const FilterOptions = () => {
  return (
    <div>
            <div className="flex items-center justify-end gap-2">
                <Button variant='secondary' className="shadow-2xl">
                   <CalendarDays className="w-4 h-4" /> Date
                </Button>
                <Button variant='secondary' className="shadow-2xl">
                    <FolderUp className="w-4 h-4"/> Export
                </Button>
                <Button variant='secondary' className="shadow-2xl">
                    <SlidersHorizontal className="w-4 h-4"/>
                </Button>
            </div>
    </div>
  )
}

export default FilterOptions