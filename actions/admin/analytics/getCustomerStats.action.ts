"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import mongoose from "mongoose";

export interface CustomerStats {
  totalUsers: number;
  totalUsersChange: string;
  totalUsersUp: boolean;
  newUsersThisMonth: number;
  newUsersChange: string;
  newUsersUp: boolean;
  activeUsers: number; // walletBalance > 0
  activeUsersChange: string;
  activeUsersUp: boolean;
  avgMonthlyBudget: number; // in dollars (divided by 100 already)
  avgBudgetChange: string;
  avgBudgetUp: boolean;
}

/**
 * Computes customer overview stats.
 * - Pass storeId to scope to one store's customers.
 * - Omit / pass null for platform-wide stats.
 */
export async function getCustomerStats(
  storeId?: string | null,
): Promise<CustomerStats> {
  await dbConnect();

  const filter: Record<string, any> = {};
  if (storeId) filter.associatedStoreId = new mongoose.Types.ObjectId(storeId);

  const customers = await Customer.find(filter).lean();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const pct = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "100" : "0";
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Total users
  const totalUsers = customers.length;
  const totalUsersLastMonth = customers.filter(
    (c) => new Date(c.createdAt as any) <= endOfLastMonth,
  ).length;

  // New this month
  const newUsersThisMonth = customers.filter(
    (c) => new Date(c.createdAt as any) >= startOfMonth,
  ).length;
  const newUsersLastMonth = customers.filter((c) => {
    const d = new Date(c.createdAt as any);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }).length;

  // Active (walletBalance > 0)
  const activeUsersThisMonth = customers.filter(
    (c) => (c.walletBalance ?? 0) > 0,
  ).length;
  const activeUsersLastMonth = customers.filter(
    (c) =>
      new Date(c.createdAt as any) <= endOfLastMonth &&
      (c.walletBalance ?? 0) > 0,
  ).length;

  // Avg monthly budget (stored in cents)
  const avgBudgetCents =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.monthlyBudget ?? 0), 0) /
        customers.length
      : 0;

  const lastMonthCustomers = customers.filter(
    (c) => new Date(c.createdAt as any) <= endOfLastMonth,
  );
  const avgBudgetLastMonthCents =
    lastMonthCustomers.length > 0
      ? lastMonthCustomers.reduce((sum, c) => sum + (c.monthlyBudget ?? 0), 0) /
        lastMonthCustomers.length
      : 0;

  return {
    totalUsers,
    totalUsersChange: pct(totalUsers, totalUsersLastMonth),
    totalUsersUp: totalUsers >= totalUsersLastMonth,

    newUsersThisMonth,
    newUsersChange: pct(newUsersThisMonth, newUsersLastMonth),
    newUsersUp: newUsersThisMonth >= newUsersLastMonth,

    activeUsers: activeUsersThisMonth,
    activeUsersChange: pct(activeUsersThisMonth, activeUsersLastMonth),
    activeUsersUp: activeUsersThisMonth >= activeUsersLastMonth,

    avgMonthlyBudget: avgBudgetCents / 100,
    avgBudgetChange: pct(avgBudgetCents, avgBudgetLastMonthCents),
    avgBudgetUp: avgBudgetCents >= avgBudgetLastMonthCents,
  };
}
