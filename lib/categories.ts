

export const categories = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Beverages",
  "Snacks",
  "Household",
  "Oil & Ghee",
  "Pulses & Lentils",
  "Flour & Atta",
  "Rice",
  "Spices",
  "Pickles & Chutneys",
  "Instant Foods",
  "Frozen Foods",
  "Sweets & Mithai",
  "Dry Fruits & Nuts",
  "Tea & Coffee",
  "Sauces & Condiments",
  "Papad & Fryums",
  "Pooja / Religious Items",
  "Utensils",
  "Disposables",
  "Personal Care",
  "Other",
] as const;

export type Category = (typeof categories)[number];
