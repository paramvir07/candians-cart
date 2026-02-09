import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const OrderRowSkeleton = () => {
  return (
    <tr className="border-b border-slate-100 last:border-none">
      {/* Order ID */}
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
      
      {/* Customer Name */}
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-32" />
      </td>
      
      {/* Date */}
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-24" />
      </td>
      
      {/* Amount */}
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
      
      {/* Status Badge (Pill shape) */}
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      
      {/* Action Button (Circle) */}
      <td className="py-4 px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </td>
    </tr>
  );
};

export default OrderRowSkeleton;