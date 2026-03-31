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

// Extracted logic for reusability and testing
function calculateOrderMetrics(inputs) {
  // Destructure inputs for cleaner code access
  const {
    cartTotal,
    totalBasePrice,
    subsidy,
    totalDisposableTax,
    totalGST,
    totalPST,
    totalCashCollected = 0,
  } = inputs;

  const STORE_PROFIT_MARGIN = 0.3;

  // Total Tax
  const totalTax = totalGST + totalPST;

  // Total Markup = Cart Total - (Total Base Price + Total Disposable Fee + Total Tax)
  const totalMarkup =
    cartTotal - (totalBasePrice + totalDisposableTax + totalTax);

  // Apportioning based on values
  const val = totalBasePrice + totalMarkup;

  // Guard against division by zero
  const basePercentage = val > 0 ? totalBasePrice / val : 0;
  const markupPercentage = val > 0 ? totalMarkup / val : 0;

  const baseTax = totalTax * basePercentage;
  const markupTax = totalTax * markupPercentage;
  const storeMarkupTax = markupTax * 0.3;

  // Store Fixed Value (SFV)
  // Assuming the store claims the Base Tax portion and Store Markup Tax on top of items/fees
  const sfv = totalBasePrice + totalDisposableTax + baseTax + storeMarkupTax;

  // Gross Margin = Customer Paid - SFV
  const grossMargin = cartTotal - sfv;

  // Store Profit = Total Markup * 30%
  const storeProfit = totalMarkup * STORE_PROFIT_MARGIN;

  // Store Payout = (Store Profit + SFV) - totalCashCollected
  const storePayout = storeProfit + sfv - totalCashCollected;

  // Platform Profit = Customer Paid - (Store Profit + SFV)
  const platformProfit = cartTotal - (storeProfit + sfv);

  // Platform Commission = Our Profit + Subsidy
  const platformCommission = platformProfit + subsidy;

  return {
    totalTax,
    totalMarkup,
    val, // returning val to show it in the logs
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
    "Total Cash Collected (Order + Topup) ($): ",
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
    `Total Tax = totalGST ${totalGST.toFixed(2)} + totalPST ${totalPST.toFixed(2)} = $${metrics.totalTax.toFixed(2)}`,
  );
  console.log(
    `Total Markup = cartTotal ${cartTotal.toFixed(2)} - (totalBasePrice ${totalBasePrice.toFixed(2)} + totalDisposableTax ${totalDisposableTax.toFixed(2)} + totalTax ${metrics.totalTax.toFixed(2)}) = $${metrics.totalMarkup.toFixed(2)}`,
  );

  console.log("\nApportioning Value (Val) = totalBasePrice + totalMarkup");
  console.log(
    `Val = ${totalBasePrice.toFixed(2)} + ${metrics.totalMarkup.toFixed(2)} = ${metrics.val.toFixed(2)}`,
  );

  console.log(
    `Base Percentage = (totalBasePrice ${totalBasePrice.toFixed(2)} / Val ${metrics.val.toFixed(2)}) * 100 = ${metrics.basePercentage.toFixed(2)}%`,
  );
  console.log(
    `Markup Percentage = (totalMarkup ${metrics.totalMarkup.toFixed(2)} / Val ${metrics.val.toFixed(2)}) * 100 = ${metrics.markupPercentage.toFixed(2)}%`,
  );

  console.log(
    `Base Tax Portion = totalTax ${metrics.totalTax.toFixed(2)} * ${metrics.basePercentage.toFixed(2)}% = $${metrics.baseTax.toFixed(2)}`,
  );
  console.log(
    `Markup Tax Portion = totalTax ${metrics.totalTax.toFixed(2)} * ${metrics.markupPercentage.toFixed(2)}% = $${metrics.markupTax.toFixed(2)}`,
  );
  console.log(
    `Store Markup Tax = markupTax ${metrics.markupTax.toFixed(2)} * 0.30 = $${metrics.storeMarkupTax.toFixed(2)}`,
  );

  console.log("\n--- Store Metrics ---");
  console.log(
    `Store Fixed Value (SFV) = totalBasePrice ${totalBasePrice.toFixed(2)} + totalDisposableTax ${totalDisposableTax.toFixed(2)} + baseTax ${metrics.baseTax.toFixed(2)} + storeMarkupTax ${metrics.storeMarkupTax.toFixed(2)} = $${metrics.sfv.toFixed(2)}`,
  );
  console.log(
    `Gross Margin = cartTotal ${cartTotal.toFixed(2)} - sfv ${metrics.sfv.toFixed(2)} = $${metrics.grossMargin.toFixed(2)}`,
  );
  console.log(
    `Store Profit = totalMarkup ${metrics.totalMarkup.toFixed(2)} * 0.30 = $${metrics.storeProfit.toFixed(2)}`,
  );
  console.log(
    `Store Payout = storeProfit ${metrics.storeProfit.toFixed(2)} + sfv ${metrics.sfv.toFixed(2)} - totalCashCollected ${totalCashCollected.toFixed(2)} = $${metrics.storePayout.toFixed(2)}`,
  );

  console.log("\n--- Platform Metrics ---");
  console.log(
    `Platform Profit = cartTotal ${cartTotal.toFixed(2)} - (storeProfit ${metrics.storeProfit.toFixed(2)} + sfv ${metrics.sfv.toFixed(2)}) = $${metrics.platformProfit.toFixed(2)}`,
  );
  console.log(
    `Platform Commission = platformProfit ${metrics.platformProfit.toFixed(2)} + subsidy ${subsidy.toFixed(2)} = $${metrics.platformCommission.toFixed(2)}`,
  );

  // --- Verifications ---
  console.log(`\n--- Verification 1: Customer Paid ---`);
  console.log(
    `Formula: Our Profit + Store Payout + Cash Collected = Customer Paid`,
  );

  const customerPaidCalc =
    metrics.platformProfit + metrics.storePayout + totalCashCollected;
  // Using Math.abs with a small epsilon (0.01) to handle floating-point inaccuracies
  if (Math.abs(customerPaidCalc - cartTotal) < 0.01) {
    console.log(
      `✅ SUCCESS: Calculated matches Input ($${customerPaidCalc.toFixed(2)} == $${cartTotal.toFixed(2)})`,
    );
  } else {
    console.log(
      `❌ FAILED: Calculated DOES NOT match Input ($${customerPaidCalc.toFixed(2)} != $${cartTotal.toFixed(2)})`,
    );
  }
  console.log(
    `Breakdown: platformProfit $${metrics.platformProfit.toFixed(2)} + storePayout $${metrics.storePayout.toFixed(2)} + totalCashCollected $${totalCashCollected.toFixed(2)} = $${customerPaidCalc.toFixed(2)}`,
  );

  console.log(`\n--- Verification 2: Percentage Split ---`);
  console.log(`Formula: Base Percentage + Markup Percentage = 100%`);

  const totalPercentageCalc = metrics.basePercentage + metrics.markupPercentage;
  const expectedPercentage = totalBasePrice + metrics.totalMarkup > 0 ? 100 : 0;

  if (Math.abs(totalPercentageCalc - expectedPercentage) < 0.01) {
    console.log(
      `✅ SUCCESS: Total Percentage equals ${totalPercentageCalc.toFixed(2)}%`,
    );
  } else {
    console.log(
      `❌ FAILED: Total Percentage equals ${totalPercentageCalc.toFixed(2)}%, expected ${expectedPercentage}%`,
    );
  }
  console.log(
    `Breakdown: basePercentage ${metrics.basePercentage.toFixed(2)}% + markupPercentage ${metrics.markupPercentage.toFixed(2)}% = ${totalPercentageCalc.toFixed(2)}%`,
  );

  rl.close();
}

main();
