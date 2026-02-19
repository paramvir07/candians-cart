// import { Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
// import OrderRow from './OrderRow';

// // Sample Data to match your screenshot
// const SAMPLE_ORDERS = [
//   { id: "#54321", customer: "John Doe", date: "2026-02-08", amount: "$110", status: "Ready for Pickup" },
//   { id: "#54322", customer: "Jane Smith", date: "2026-02-3", amount: "$70", status: "Processing" },
//   { id: "#54323", customer: "The Lee Family", date: "2026-01-25", amount: "$90", status: "Completed" },
//   { id: "#54324", customer: "Michael Clark", date: "2026-01-12", amount: "$100", status: "Completed" },
//   { id: "#54325", customer: "The Chen Family", date: "2025-12-31", amount: "$150", status: "Cancelled" },
// ];

// const OrdersTable = () => {
//   return (
//     <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

//       {/* 1. Header Section */}
//       <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
//         <h2 className="text-xl font-bold text-slate-900">All Orders</h2>

//         <div className="flex gap-3">
//           {/* Filter Dropdown Mockup */}
//           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
//             Filter by Status
//             <ChevronDown className="w-4 h-4" />
//           </button>

//           {/* Date Dropdown Mockup */}
//           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
//             Last 30 days
//             <ChevronDown className="w-4 h-4" />
//           </button>

//           {/* Download Button */}
//           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
//             <Download className="w-4 h-4" />
//             Download Report
//           </button>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Order ID</th>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Customer</th>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Date</th>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Amount</th>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Status</th>
//               <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Details</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm">
//             {SAMPLE_ORDERS.map((order, index) => (
//               <OrderRow key={index} order={order} />
//             //   This is where skeleton will come
//             // <OrderRowSkeleton key={1} />
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 3. Footer / Pagination */}
//       <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2">
//         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-50">
//           <ChevronLeft className="w-4 h-4" />
//         </button>

//         {/* Active Page */}
//         <button className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm shadow-emerald-100">
//           1
//         </button>

//         {/* Next Page */}
//         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
//           <ChevronRight className="w-4 h-4" />
//         </button>
//       </div>

//     </div>
//   );
// };

// export default OrdersTable;
