"use client";

import * as React from "react";
import { OrderForm } from "@/components/store/orders/addOrder/OrderForm"; 
import { OrderSummary } from "@/components/store/orders/addOrder/SummmaryCard";

// Define types locally or import them
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  stock: number;
  type: "unit" | "weight";
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function AddOrderPage() {
  // 1. Initialize cart as an EMPTY ARRAY [], not undefined
  const [cart, setCart] = React.useState<CartItem[]>([]);

  // 2. Customer State
  const [customer, setCustomer] = React.useState<Customer | null>(null);

  // 3. Handlers to update state from the Form
  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (product.type === "unit") {
          // Increment unit items
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return prev; // Don't auto-increment weight items
      }
      return [
        ...prev,
        { ...product, quantity: product.type === "weight" ? 1.0 : 1 },
      ];
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Manual Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2">
          <OrderForm
            cart={cart}
            onCustomerSelect={setCustomer}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            selectedCustomer={customer}
          />
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart} // passing the state correctly here
            customer={customer}
            onSubmit={(data) => console.log("SUBMITTING:", data)}
          />
        </div>
      </div>
    </div>
  );
}
