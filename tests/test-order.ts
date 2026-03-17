// npx tsx tests/test-order.ts
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<number> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const parsed = Number(answer);
      resolve(isNaN(parsed) ? 0 : parsed);
    });
  });
}

// Extracted logic for reusability and testing
export function calculateOrderMetrics(inputs: {
  cartTotal: number;
  totalBasePrice: number;
  subsidy: number;
  totalDisposableTax: number;
  totalGST: number;
  totalPST: number;
}) {
  const totalTax = inputs.totalGST + inputs.totalPST;
  const sfv = inputs.totalBasePrice + inputs.totalDisposableTax + totalTax; // Store Fixed Value
  const grossMargin = inputs.cartTotal - sfv;
  const storeProfit = Math.round((grossMargin + inputs.subsidy) * 0.30);
  const storePayout = sfv + storeProfit;
  const platformProfit = inputs.cartTotal - storePayout;
  const platformCommission = platformProfit + inputs.subsidy;

  return {
    totalTax,
    sfv,
    grossMargin,
    storeProfit,
    storePayout,
    platformProfit,
    platformCommission,
  };
}

async function main() {
  console.log("--- Order Financials Tester ---");
  const noOfOrders = await ask("Total number of Orders: ");
  const cartTotal = await ask("Cart Total ($): ");
  const totalBasePrice = await ask("Total base price ($): ");
  const subsidy = await ask("Total Subsidy of order ($): ");
  const totalDisposableTax = await ask("Total Disposable Tax ($): ");
  const totalGST = await ask("Enter total GST ($): ");
  const totalPST = await ask("Enter total PST ($): ");

  const metrics = calculateOrderMetrics({
    cartTotal,
    totalBasePrice: totalBasePrice,
    subsidy,
    totalDisposableTax,
    totalGST,
    totalPST,
  });

  console.log("\n--- Results ---");
  console.log(`Total Tax: $${metrics.totalTax.toFixed(2)}`);
  console.log(`Store Fixed Value (SFV): $${metrics.sfv.toFixed(2)}`);
  console.log(`Gross Margin: $${metrics.grossMargin.toFixed(2)}`);
  console.log(`Store Profit: $${metrics.storeProfit.toFixed(2)}`);
  console.log(`Store Payout: $${metrics.storePayout.toFixed(2)}`);
  console.log(`Platform Profit: $${metrics.platformProfit.toFixed(2)}`);
  console.log(`Platform Commission: $${metrics.platformCommission.toFixed(2)}`);

  rl.close();
}

main();