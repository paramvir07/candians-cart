// npx tsx --env-file=.env tests/test-db-analytics.ts
import * as readline from "readline";
import mongoose from "mongoose";
import { dbConnect } from "../db/dbConnect";
import OrderModel, { PlaceOrderI } from "../db/models/customer/Orders.Model";
import { getOverviewStats } from "../actions/admin/analytics/analytics.action";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askString(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function askNumber(question: string): Promise<number> {
  return new Promise((resolve) => rl.question(question, (ans) => resolve(Number(ans))));
}

async function main() {
  await dbConnect();
  console.log("Connected to Database.\n");

  console.log("--- Current Analytics ---");
  const initialStats = await getOverviewStats();
  console.log(initialStats);

  console.log("\n--- Create Test Order ---");
  
  // Required ObjectIds (Ensure you use valid ones from your DB for a true test)
  const userIdStr = await askString("Enter User ID (ObjectId): ");
  const storeIdStr = await askString("Enter Store ID (ObjectId): ");
  const cartTotal = await askNumber("Cart Total (in cents): ");
  const baseTotal = await askNumber("Base Total (in cents): ");
  const subsidy = await askNumber("Total Subsidy (in cents): ");

  // Create document strictly abiding by the PlaceOrderI type
  const newOrder: Partial<PlaceOrderI> = {
    userId: new mongoose.Types.ObjectId(userIdStr),
    storeId: new mongoose.Types.ObjectId(storeIdStr),
    products: [], 
    subsidyItems: [],
    TotalGST: 0,
    TotalPST: 0,
    TotalDisposableFee: 0,
    BaseTotal: baseTotal,
    cartTotal: cartTotal,
    subsidy: subsidy,
    subsidyLeft: 0,
    subsidyUsed: subsidy,
    status: "completed", // Set to completed so it shows up in getOverviewStats()
    paymentMode: "wallet"
  };

  try {
    const order = await OrderModel.create(newOrder);
    console.log(`\n✅ Order Created Successfully! ID: ${order._id}`);

    console.log("\n--- New Analytics ---");
    const updatedStats = await getOverviewStats();
    console.log(updatedStats);

  } catch (error) {
    console.error("❌ Failed to create order:", error);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

main();