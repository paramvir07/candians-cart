import React from 'react';
import { Eye } from "lucide-react";

type OrderStatus =
  | "Ready for Pickup"
  | "Processing"
  | "Completed"
  | "Cancelled";

type Order = {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: OrderStatus;
}

type OrderRowProps = {
    order: Order;
}

const OrderRow = ({ order } : OrderRowProps) => {
  
  // Helper to get badge styles based on status
  const getStatusStyles = (status : OrderStatus) => {
    switch (status) {
      case "Ready for Pickup":
        return "bg-blue-100 text-blue-700";
      case "Processing":
        return "bg-amber-100 text-amber-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <tr className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
      <td className="py-4 px-4 font-medium text-slate-900">
        {order.id}
      </td>
      
      <td className="py-4 px-4 text-slate-600">
        {order.customer}
      </td>
      
      <td className="py-4 px-4 text-slate-600">
        {order.date}
      </td>
      
      <td className="py-4 px-4 font-medium text-slate-900">
        {order.amount}
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(order.status)}`}>
          {order.status}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <button className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default OrderRow;