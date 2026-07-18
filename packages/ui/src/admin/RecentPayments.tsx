import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { RefreshCcw } from "lucide-react"

const payments = [
  { email: "alex@shopper.com", store: "Sabzi Mandi Supermarket", amount: "$124.00" },
  { email: "maria@retail.io", store: "Day To Day Grocery", amount: "$89.50" },
  { email: "dev@coffee.co", store: "SKT Farm Market", amount: "$42.00" },
  { email: "sales@techify.com", store: "Neufeld Farm Market", amount: "$299.99" },
  { email: "owner@planty.ca", store: "Alpha Grocery", amount: "$61.20" },
]


const RecentPayments = () => {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Recent Payments</h2>
          <p className="text-sm text-muted-foreground">
            Recent payment transactions across the platform.
          </p>
        </div>

        <Button size="icon" variant="ghost">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {payments.map((payment, idx) => (
          <Card
            key={idx}
            className="flex justify-between px-4 py-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium">{payment.email}</p>
                <p className="text-xs text-muted-foreground">{payment.store}</p>
                </div>
              
              <p className="text-sm font-semibold">
                {payment.amount}
              </p>
            </div>

          </Card>
        ))}

        <div className="text-right pt-2">
          <Button variant="link" className="text-sm px-0">
            Show all →
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RecentPayments
