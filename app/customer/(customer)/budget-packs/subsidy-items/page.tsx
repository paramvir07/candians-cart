

import { getSubsidizedProducts } from "@/actions/customer/ProductAndStore/Cart.Action";
import SubsidyItemsClient from "@/components/customer/budgetpacks/subsidyItemsClient";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: boolean;
  subsidised: boolean;
}

const FULLY_COVERED = [" "];

export default async function SubsidyItemsPage() {
  const allItems: Product[] = await getSubsidizedProducts();

  // Group by category, skip fully-covered ones
  const grouped: Record<string, Product[]> = {};
  for (const item of allItems) {
    if (FULLY_COVERED.includes(item.category)) continue;
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const categoryKeys = Object.keys(grouped).sort();

  return <SubsidyItemsClient grouped={grouped} categoryKeys={categoryKeys} />;
}