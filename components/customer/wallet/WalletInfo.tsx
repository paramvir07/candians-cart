import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Info } from "lucide-react"

export function WalletInfo() {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
          <Info className="h-4 w-4 cursor-pointer" />
      </HoverCardTrigger>

      <HoverCardContent className="w-64 mr-5 mt-3">
        <div className="font-semibold">Wallet Info</div>
        <div className="text-sm text-muted-foreground mt-1">
          This shows your wallet details and transaction history.
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
