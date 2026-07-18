// "use client";

// import * as React from "react";
// import {
//   Check,
//   ChevronsUpDown,
//   Plus,
//   Minus,
//   Trash2,
//   Search,
//   User,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { IProduct } from "@/types/store/products.types";

// // --- TYPES ---
// // These should ideally match what's in your page.tsx or a shared types file
// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   unit: string;
//   stock: number;
//   type: "unit" | "weight";
// }

// interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
// }

// interface OrderFormProps {
//   cart: CartItem[];
//   selectedCustomer: Customer | null;
//   onCustomerSelect: (customer: Customer | null) => void;
//   onAddToCart: (product: IProduct) => void;
//   onUpdateQuantity: (id: string, qty: number) => void;
//   onRemoveItem: (id: string) => void;
// }

// // --- MOCK DATA ---
// const USERS = [
//   {
//     id: "u1",
//     name: "Alice Johnson",
//     email: "alice@example.com",
//     phone: "555-0101",
//   },
//   { id: "u2", name: "Bob Smith", email: "bob@work.com", phone: "555-0102" },
//   {
//     id: "u3",
//     name: "Charlie Brown",
//     email: "charlie@gmail.com",
//     phone: "555-0103",
//   },
// ];

// const PRODUCTS = [
//   {
//     id: "p1",
//     name: "Daal Masoor Desi",
//     price: 2.8,
//     unit: "pkg",
//     stock: 20,
//     type: "unit",
//   },
//   {
//     id: "p2",
//     name: "Red Onions",
//     price: 1.99,
//     unit: "kg",
//     stock: 50,
//     type: "weight",
//   },
//   {
//     id: "p3",
//     name: "Basmati Rice (10kg)",
//     price: 18.5,
//     unit: "bag",
//     stock: 15,
//     type: "unit",
//   },
//   {
//     id: "p4",
//     name: "Green Chilies",
//     price: 4.5,
//     unit: "kg",
//     stock: 10,
//     type: "weight",
//   },
// ];

// export function OrderForm({
//   cart,
//   selectedCustomer,
//   onCustomerSelect,
//   onAddToCart,
//   onUpdateQuantity,
//   onRemoveItem,
// }: OrderFormProps) {
//   // UI State only (Popovers)
//   const [openUser, setOpenUser] = React.useState(false);
//   const [openProduct, setOpenProduct] = React.useState(false);

//   return (
//     <div className="space-y-6">
//       {/* SECTION 1: CUSTOMER SELECTION */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-md font-medium">
//             Customer Details
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Popover open={openUser} onOpenChange={setOpenUser}>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 role="combobox"
//                 aria-expanded={openUser}
//                 className="w-full justify-between"
//               >
//                 {selectedCustomer
//                   ? `${selectedCustomer.name} (${selectedCustomer.phone})`
//                   : "Search customer by name, email, or phone..."}
//                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-100 p-0" align="start">
//               <Command>
//                 <CommandInput placeholder="Search customer..." />
//                 <CommandList>
//                   <CommandEmpty>No customer found.</CommandEmpty>
//                   <CommandGroup>
//                     {USERS.map((user) => (
//                       <CommandItem
//                         key={user.id}
//                         value={`${user.name} ${user.email} ${user.phone}`}
//                         onSelect={() => {
//                           onCustomerSelect(user);
//                           setOpenUser(false);
//                         }}
//                       >
//                         <User className="mr-2 h-4 w-4 text-muted-foreground" />
//                         <div className="flex flex-col">
//                           <span className="font-medium">{user.name}</span>
//                           <span className="text-xs text-muted-foreground">
//                             {user.email} • {user.phone}
//                           </span>
//                         </div>
//                         {selectedCustomer?.id === user.id && (
//                           <Check className="ml-auto h-4 w-4" />
//                         )}
//                       </CommandItem>
//                     ))}
//                   </CommandGroup>
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>
//         </CardContent>
//       </Card>

//       {/* SECTION 2: PRODUCT SEARCH & CART */}
//       <Card className="min-h-125">
//         <CardHeader className="flex flex-row items-center justify-between pb-4">
//           <CardTitle className="text-md font-medium">Order Items</CardTitle>

//           {/* PRODUCT SEARCH BAR */}
//           <Popover open={openProduct} onOpenChange={setOpenProduct}>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="w-62.5 justify-between text-muted-foreground"
//               >
//                 <span className="flex items-center gap-2">
//                   <Search className="h-4 w-4" />
//                   Add Product...
//                 </span>
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-75 p-0" align="end">
//               <Command>
//                 <CommandInput placeholder="Search products..." />
//                 <CommandList>
//                   <CommandEmpty>No product found.</CommandEmpty>
//                   <CommandGroup heading="Suggestions">
//                     {PRODUCTS.map((product) => (
//                       <CommandItem
//                         key={product.id}
//                         onSelect={() => {
//                           onAddToCart(product);
//                           setOpenProduct(false);
//                         }}
//                       >
//                         <div className="flex flex-col">
//                           <span>{product.name}</span>
//                           <span className="text-xs text-muted-foreground">
//                             ${product.price.toFixed(2)} / {product.unit} •
//                             Stock: {product.stock}
//                           </span>
//                         </div>
//                       </CommandItem>
//                     ))}
//                   </CommandGroup>
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>
//         </CardHeader>

//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[40%]">Product</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Quantity / Weight</TableHead>
//                 <TableHead className="text-right">Total</TableHead>
//                 <TableHead className="w-12.5"></TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {cart.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={5}
//                     className="h-24 text-center text-muted-foreground"
//                   >
//                     No items added yet. Search above to begin.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 cart.map((item) => (
//                   <TableRow key={item.id}>
//                     <TableCell className="font-medium">
//                       {item.name}
//                       <div className="text-xs text-muted-foreground">
//                         Stock: {item.stock} {item.unit}
//                       </div>
//                     </TableCell>
//                     <TableCell>${item.price.toFixed(2)}</TableCell>
//                     <TableCell>
//                       {/* SMART INPUT LOGIC */}
//                       {item.type === "weight" ? (
//                         <div className="flex items-center gap-2">
//                           <Input
//                             type="number"
//                             min="0"
//                             step="0.01"
//                             className="w-20 h-8"
//                             value={item.quantity}
//                             onChange={(e) =>
//                               onUpdateQuantity(
//                                 item.id,
//                                 parseFloat(e.target.value),
//                               )
//                             }
//                           />
//                           <span className="text-sm text-muted-foreground">
//                             {item.unit}
//                           </span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8"
//                             onClick={() =>
//                               onUpdateQuantity(item.id, item.quantity - 1)
//                             }
//                             disabled={item.quantity <= 1}
//                           >
//                             <Minus className="h-3 w-3" />
//                           </Button>
//                           <span className="w-8 text-center text-sm">
//                             {item.quantity}
//                           </span>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8"
//                             onClick={() =>
//                               onUpdateQuantity(item.id, item.quantity + 1)
//                             }
//                             disabled={item.quantity >= item.stock}
//                           >
//                             <Plus className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right font-medium">
//                       ${(item.price * item.quantity).toFixed(2)}
//                     </TableCell>
//                     <TableCell>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
//                         onClick={() => onRemoveItem(item.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
