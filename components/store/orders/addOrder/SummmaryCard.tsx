// "use client";

// import * as React from "react";
// import { Loader2, CreditCard, Send, CheckCircle2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// // --- TYPES (Match your main page types) ---
// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number; // This acts as weight for weighted items
//   unit: string;
// }

// interface Customer {
//   id: string;
//   name: string;
//   email: string;
// }

// interface AdminOrderSummaryProps {
//   cart: CartItem[];
//   customer: Customer | null;
//   isSubmitting?: boolean;
//   onSubmit: (data: any) => void;
// }

// export function OrderSummary({
//   cart = [],
//   customer,
//   isSubmitting = false,
//   onSubmit,
// }: AdminOrderSummaryProps) {
//   // --- STATE ---
//   const [paymentStatus, setPaymentStatus] = React.useState("unpaid");
//   const [paymentMethod, setPaymentMethod] = React.useState("cash");
//   const [notes, setNotes] = React.useState("");

//   // --- CALCULATIONS ---
//   const subtotal = cart.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );
//   const gst = subtotal * 0.05; // 5% GST
//   const pst = subtotal * 0.07; // 7% PST (BC Standard)
//   const total = subtotal + gst + pst;

//   // --- HANDLER ---
//   const handleCreateOrder = () => {
//     const orderData = {
//       customerId: customer?.id,
//       items: cart.map((item) => ({
//         productId: item.id,
//         quantity: item.quantity,
//         priceAtPurchase: item.price,
//       })),
//       totals: { subtotal, gst, pst, total },
//       payment: { status: paymentStatus, method: paymentMethod },
//       notes: notes,
//     };
//     onSubmit(orderData);
//   };

//   const isValid = customer && cart.length > 0;

//   return (
//     <Card className="h-fit sticky top-6">
//       <CardHeader>
//         <CardTitle>Order Summary</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         {/* COST BREAKDOWN */}
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">
//               Subtotal ({cart.length} items)
//             </span>
//             <span>${subtotal.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">GST (5%)</span>
//             <span>${gst.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">PST (7%)</span>
//             <span>${pst.toFixed(2)}</span>
//           </div>

//           <Separator className="my-2" />

//           <div className="flex justify-between font-bold text-lg">
//             <span>Total</span>
//             <span>${total.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* ADMIN CONTROLS */}
//         <div className="space-y-4">
//           {/* Payment Status */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label className="text-xs">Payment Status</Label>
//               <Select value={paymentStatus} onValueChange={setPaymentStatus}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="unpaid">Unpaid</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Show Method only if Paid */}
//             {paymentStatus === "paid" && (
//               <div className="space-y-2">
//                 <Label className="text-xs">Method</Label>
//                 <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cash">Cash</SelectItem>
//                     <SelectItem value="debit">Debit/Credit (POS)</SelectItem>
//                     <SelectItem value="etransfer">E-Transfer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           </div>

//           {/* Internal Notes */}
//           <div className="space-y-2">
//             <Label className="text-xs">Internal Notes</Label>
//             <Textarea
//               placeholder="e.g. Customer will pickup at 5pm..."
//               className="resize-none h-20"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//             />
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="flex flex-col gap-3">
//         {/* PRIMARY ACTION */}
//         <Button
//           className="w-full font-bold"
//           size="lg"
//           disabled={!isValid || isSubmitting}
//           onClick={handleCreateOrder}
//         >
//           {isSubmitting ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : paymentStatus === "paid" ? (
//             <>
//               <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Order
//             </>
//           ) : (
//             <>
//               <Send className="mr-2 h-4 w-4" /> Create Invoice
//             </>
//           )}
//         </Button>

//         {/* SECONDARY MESSAGE */}
//         {!isValid && (
//           <p className="text-xs text-center text-red-500">
//             {!customer ? "Select a customer to proceed" : "Add items to cart"}
//           </p>
//         )}
//       </CardFooter>
//     </Card>
//   );
// }
