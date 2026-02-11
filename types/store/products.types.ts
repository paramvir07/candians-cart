import {Types} from "mongoose";

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
  stock: number;
  images: (ProductImage & { _id?: Types.ObjectId })[];
  createdAt: Date;
  updatedAt: Date;
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
  | "Personal Care" 
  | "Other";

export type TaxRate = 0.00 | 0.05 | 0.07 | 0.12;

export interface ProductImage {
  url: string;
  fileId: string;
  _id?: string; // Mongoose adds IDs to subdocuments by default
}

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
  stock: number;
  images: ProductImage[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Optional: specific type for the server action response
export type ProductActionResponse = 
  | { success: true; data: IProduct[] }
  | { success: false; error: string };