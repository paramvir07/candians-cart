// import { atom } from "jotai";
// import { IProduct } from "@/types/store/products.types";

// export interface CartItem extends IProduct {
//   orderQuantity: number;
// }

// export interface OrderTotals {
//   subtotal: number;
//   taxTotal: number;
//   finalTotal: number;
//   itemCount: number;
// }

// // raw list of products fetched
// export const productsAtom = atom<IProduct[]>([]);

// // Holds the search Query parameter from OrderForm Component
// export const productSearchQueryAtom = atom<string>("");

// // Holds the current cart items
// export const cartAtom = atom<CartItem[]>([]);

// // get products based on the query
// export const filteredProductsAtom = atom((get) => {
//   const products = get(productsAtom);
//   const query = get(productSearchQueryAtom).toLocaleLowerCase();

//   if (!query) return products;

//   return products.filter(
//     (p) =>
//       p.name.toLowerCase().includes(query) ||
//       p.category.toLowerCase().includes(query),
//   );
// });

// // Calculating the totals
// export const orderTotalsAtom = atom<OrderTotals>((get) => {
//   const cart = get(cartAtom);

//   // We explicitly type the accumulator here to avoid TS errors
//   const totals = cart.reduce<{ subtotal: number; taxTotal: number; itemCount: number }>(
//     (acc, item) => {
//       const itemTotal = item.price * item.orderQuantity;
      
//       // Ensure tax is a number (handle 0 or undefined safely)
//       const taxRate = item.tax ?? 0;
//       const itemTax = itemTotal * taxRate;

//       return {
//         subtotal: acc.subtotal + itemTotal,
//         taxTotal: acc.taxTotal + itemTax,
//         itemCount: acc.itemCount + item.orderQuantity,
//       };
//     },
//     { subtotal: 0, taxTotal: 0, itemCount: 0 } 
//   );

//   return {
//     ...totals,
//     finalTotal: Math.round(totals.subtotal + totals.taxTotal),
//   };
// });

// export const addToCartAtom = atom(null, (get, set, product: IProduct) => {
//   const currentCart = get(cartAtom);
//   const existingItem = currentCart.find((item) => item._id === product._id);

//   if (existingItem) {
//     if (existingItem.orderQuantity < product.stock) {
//       set(
//         cartAtom,
//         currentCart.map((item) =>
//           item._id === product._id
//             ? { ...item, orderQuantity: item.orderQuantity + 1 }
//             : item,
//         ),
//       );
//     } else {
//         set(cartAtom, [...currentCart, {...product, orderQuantity: 1}])
//     }
//   }
// });

// export const updateCartQuantityAtom = atom(
//     null,
//     (get, set, {id, quantity} : {id: string; quantity: number}) => {
//         const currentCart = get(cartAtom);
//         if(quantity <= 0){
//             set(cartAtom, currentCart.filter((item) => item._id !== id));
//             return;
//         }
//         set(cartAtom, currentCart.map((item) => {
//             if(item._id === id){
//                 const validQuantity = quantity > item.stock ? item.stock : quantity;
//                 return {...item, orderQuantity: validQuantity}
//             }
//             return item;
//         }))
//     }
// );

// export const removeFromCartAtom = atom(
//     null,
//     (get, set, id: string) =>{
//         set(cartAtom, get(cartAtom).filter((item) => item._id !== id));
//     }
// );

// export const clearCartAtom = atom(null, (_get, set) => set(cartAtom, []))