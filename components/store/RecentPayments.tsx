import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MoreHorizontal, ArrowUpRight } from "lucide-react"

const recentOrders = [
  { customerName: "The Johnson Family", amount: "$123.50", status: "Completed" },
  { customerName: "Emily Davis", amount: "$89.99", status: "Processing" }, // Changed 'Pending' to Processing to match typical colors
  { customerName: "Michael Brown", amount: "$45.00", status: "Completed" },
  { customerName: "Sarah Wilson", amount: "$150.75", status: "Refunded" },
  { customerName: "David Lee", amount: "$200.00", status: "Ready for Pickup" },
]
const getStatusStyles = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700"
    case "Processing":
      return "bg-yellow-100 text-yellow-700"
    case "Ready for Pickup":
    case "Ready":
      return "bg-blue-100 text-blue-700"
    case "Refunded":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}


const RecentPayments = () => {
  return (
    <Card className="mt-8 shadow-sm border-none bg-white"> 
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 font-medium text-sm">
          View all
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* Table Header */}
            <thead className="text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 pr-4 font-normal">Customer</th>
                <th className="py-3 px-4 font-normal">Amount</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 pl-4 font-normal text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                  
                  {/* Customer Name */}
                  <td className="py-4 pr-4 font-medium text-gray-900">
                    {order.customerName}
                  </td>
                  
                  {/* Amount */}
                  <td className="py-4 px-4 text-gray-600">
                    {order.amount}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Actions (Three dots) */}
                  <td className="py-4 pl-4 text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentPayments
