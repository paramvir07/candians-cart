// Run with: node tests/test-payout.js
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const parsed = Number(answer);
      resolve(isNaN(parsed) ? 0 : parsed);
    });
  });
}

// Core calculation logic
function calculateOrderMetrics(inputs) {
  const {
    cartTotal,
    totalBasePrice,
    subsidy,
    totalDisposableTax,
    totalGST,
    totalPST,
    totalCashCollected = 0,
  } = inputs;

  const STORE_PROFIT_MARGIN = 0.35;

  const totalTax = totalGST + totalPST;
  
  const totalMarkup =
    cartTotal - (totalBasePrice + totalDisposableTax + totalTax);

  const val = totalBasePrice + totalMarkup;

  const basePercentage = val > 0 ? totalBasePrice / val : 0;
  const markupPercentage = val > 0 ? totalMarkup / val : 0;

  const baseTax = totalTax * basePercentage;
  const markupTax = totalTax * markupPercentage;
  const storeMarkupTax = markupTax * STORE_PROFIT_MARGIN;

  const sfv = totalBasePrice + totalDisposableTax + baseTax + storeMarkupTax;

  const grossMargin = cartTotal - sfv;

  const storeProfit = (grossMargin) * STORE_PROFIT_MARGIN;

  const storePayout = storeProfit + sfv - totalCashCollected;

  const platformProfit = cartTotal - (storeProfit + sfv);

  const platformCommission = platformProfit + subsidy;

  const effectiveTaxRate = val > 0 ? totalTax / val : 0;

  return {
    totalTax,
    totalMarkup,
    val,
    basePercentage: basePercentage * 100,
    markupPercentage: markupPercentage * 100,
    baseTax,
    markupTax,
    storeMarkupTax,
    sfv,
    grossMargin,
    storeProfit,
    storePayout,
    platformProfit,
    platformCommission,
    effectiveTaxRate: effectiveTaxRate * 100,
  };
}

async function main() {
  console.log("--- Order Financials Tester ---");

  const cartTotal = await ask("Cart Total / Customer Paid ($): ");
  const totalBasePrice = await ask("Total base price ($): ");
  const subsidy = await ask("Total Subsidy of order ($): ");
  const totalDisposableTax = await ask("Total Disposable Fee ($): ");
  const totalGST = await ask("Enter total GST ($): ");
  const totalPST = await ask("Enter total PST ($): ");
  const totalCashCollected = await ask(
    "Total Cash Collected (Order + Topup) ($): "
  );

  const metrics = calculateOrderMetrics({
    cartTotal,
    totalBasePrice,
    subsidy,
    totalDisposableTax,
    totalGST,
    totalPST,
    totalCashCollected,
  });

  console.log("\n--- Tax & Markup Breakdown ---");
  console.log(
    `Total Tax = ${totalGST.toFixed(2)} (GST) + ${totalPST.toFixed(2)} (PST) = $${metrics.totalTax.toFixed(2)}`
  );
  
  console.log(
    `Total Markup = ${cartTotal.toFixed(2)} (Cart Total) - [${totalBasePrice.toFixed(2)} (Base Price) + ${totalDisposableTax.toFixed(2)} (Disposable Fee) + ${metrics.totalTax.toFixed(2)} (Total Tax)] = $${metrics.totalMarkup.toFixed(2)}`
  );

  console.log("\n--- Value (Val) Metrics ---");
  console.log(
    `Val = ${totalBasePrice.toFixed(2)} (Base Price) + ${metrics.totalMarkup.toFixed(2)} (Total Markup) = ${metrics.val.toFixed(2)}`
  );

  console.log(
    `Base % = ${metrics.basePercentage.toFixed(2)}% | Markup % = ${metrics.markupPercentage.toFixed(2)}%`
  );

  console.log(
    `Base Tax = $${metrics.baseTax.toFixed(2)} | Markup Tax = $${metrics.markupTax.toFixed(2)}`
  );

  console.log("\n--- Store Metrics ---");
  console.log(
    `SFV = ${totalBasePrice.toFixed(2)} (base price) + ${totalDisposableTax.toFixed(2)} (disposable fee) + ${metrics.baseTax.toFixed(2)} (base tax) + ${metrics.storeMarkupTax.toFixed(2)} (store markup tax) = $${metrics.sfv.toFixed(2)}`,
  );

  console.log(
    `Gross Margin = ${cartTotal.toFixed(2)} (Cart Total) - ${metrics.sfv.toFixed(2)} (SFV) = $${metrics.grossMargin.toFixed(2)}`
  );

  console.log(
    `Store Profit (35%) = ${metrics.grossMargin.toFixed(2)} (Gross Margin) * 0.35 = $${metrics.storeProfit.toFixed(2)}`,
  );

  console.log(
    `Store Payout = ${metrics.storeProfit.toFixed(2)} (Store Profit) + ${metrics.sfv.toFixed(2)} (SFV) - ${totalCashCollected.toFixed(2)} (Cash Collected) = $${metrics.storePayout.toFixed(2)}`
  );

  console.log("\n--- Platform Metrics ---");
  console.log(
    `Platform Profit = ${cartTotal.toFixed(2)} (Cart Total) - [${metrics.storeProfit.toFixed(2)} (Store Profit) + ${metrics.sfv.toFixed(2)} (SFV)] = $${metrics.platformProfit.toFixed(2)}`
  );

  console.log(
    `Platform Commission = ${metrics.platformProfit.toFixed(2)} (Platform Profit) + ${subsidy.toFixed(2)} (Subsidy) = $${metrics.platformCommission.toFixed(2)}`
  );

  // Verification
  console.log(`\n--- Verification ---`);

  const customerPaidCalc =
    metrics.platformProfit + metrics.storePayout + totalCashCollected;

  console.log(
    `Customer Paid Check: ${customerPaidCalc.toFixed(2)} vs ${cartTotal.toFixed(2)}`
  );

  console.log(
    `Percentage Split Verification: ${(metrics.basePercentage + metrics.markupPercentage).toFixed(2)}%`
  );

  const taxOnBasePrice = totalBasePrice * (metrics.effectiveTaxRate / 100);

  console.log(
    `Tax Verification Check: ${taxOnBasePrice.toFixed(2)} vs ${metrics.baseTax.toFixed(2)}`
  );

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});



// --- Order Financials Tester ---
// Cart Total / Customer Paid ($): 35.94
// Total base price ($): 28.60
// Total Subsidy of order ($): 10.90
// Total Disposable Fee ($): 0
// Enter total GST ($): 0.80
// Enter total PST ($): 0
// Total Cash Collected (Order + Topup) ($): 0

// --- Tax & Markup Breakdown ---
// Total Tax = 0.80 (GST) + 0.00 (PST) = $0.80
// Total Markup = 35.94 (Cart Total) - [28.60 (Base Price) + 0.00 (Disposable Fee) + 0.80 (Total Tax)] = $6.54

// --- Value (Val) Metrics ---
// Val = 28.60 (Base Price) + 6.54 (Total Markup) = 35.14
// Base % = 81.39% | Markup % = 18.61%
// Base Tax = $0.65 | Markup Tax = $0.15

// --- Store Metrics ---
// SFV = 28.60 (base price) + 0.00 (disposable fee) + 0.65 (base tax) + 0.05 (store markup tax) = $29.30
// Gross Margin = 35.94 (Cart Total) - 29.30 (SFV) = $6.64
// Store Profit (35%) = 6.64 (Gross Margin) * 0.35 = $2.32
// Store Payout = 2.32 (Store Profit) + 29.30 (SFV) - 0.00 (Cash Collected) = $31.63

// --- Platform Metrics ---
// Platform Profit = 35.94 (Cart Total) - [2.32 (Store Profit) + 29.30 (SFV)] = $4.31
// Platform Commission = 4.31 (Platform Profit) + 10.90 (Subsidy) = $15.21

// --- Verification ---
// Customer Paid Check: 35.94 vs 35.94
// Percentage Split Verification: 100.00%
// Tax Verification Check: 0.65 vs 0.65