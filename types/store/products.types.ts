import { Types } from "mongoose";

// Interface for the Server/DB (Raw Mongoose Documents)
export interface IProductDB {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  description: string;
  category: ProductCategory;
  markup: number;
  tax: TaxRate;
  disposableFee?: number;
  price: number;
  stock: boolean; // Changed to boolean
  images: (ProductImage & { _id?: Types.ObjectId })[];
  subsidised: boolean;
  isFeatured: boolean;
  InvoiceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isMeasuredInWeight?: boolean; // Optional field for weight-based products
  UOM?: string; // Optional field for unit of measurement (e.g., kg, lb)
  primaryUPC?: string; // Optional field for UPC code
}

export type ProductCategory =
  | "Fruits"
  | "Vegetables"
  | "Dairy"
  | "Meat"
  | "Bakery"
  | "Beverages"
  | "Snacks"
  | "Household"
  | "Oil & Ghee"
  | "Flour & Atta"
  | "Pulses & Lentils"
  | "Rice"
  | "Spices"
  | "Pickles & Chutneys"
  | "Instant Foods"
  | "Frozen Foods"
  | "Sweets & Mithai"
  | "Dry Fruits & Nuts"
  | "Tea & Coffee"
  | "Sauces & Condiments"
  | "Papad & Fryums"
  | "Pooja / Religious Items"
  | "Utensils"
  | "Disposables"
  | "Personal Care"
  | "Other";

export type TaxRate = 0.0 | 0.05 | 0.07 | 0.12;

export interface ProductImage {
  url: string;
  fileId: string;
  _id?: string; // Mongoose adds IDs to subdocuments by default
}

// Interface for the Frontend (Serialized data coming from Server Action)
export interface IProduct {
  _id: string; // Serialized ObjectId
  storeId: string; // Serialized ObjectId
  name: string;
  description: string;
  category: ProductCategory;
  markup: number;
  tax: TaxRate;
  disposableFee?: number; // Optional
  price: number; // In cents
  stock: boolean; // Changed it to boolean from number
  images: ProductImage[];
  subsidised: boolean;
  isFeatured: boolean;
  InvoiceId: string;
  isMeasuredInWeight?: boolean; // Optional field for weight-based products
  UOM?: string; // Optional field for unit of measurement (e.g., kg, lb)
  primaryUPC?: string; // Optional field for UPC code
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Optional: specific type for the server action response
export type ProductActionResponse =
  | { success: true; data: IProduct[] }
  | { success: false; error: string };
