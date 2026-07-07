import { ProductCategory } from "@/types/store/products.types";

export interface ICategorySaleDetail {
  productId: string;
  productName: string;
  sales: number;
  date: string; // UTC ISO string
  isMeasuredInWeight: boolean;
  uom?: string | null;
}

export interface ICategorySales {
  category: ProductCategory;
  totalSales: number;
  details: ICategorySaleDetail[];
  isMeasuredInWeight: boolean;
}