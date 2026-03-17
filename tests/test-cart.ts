// npx tsx tests/test-cart.ts
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

// Helper to find the largest Fibonacci number <= val
function getFibonacciFloor(val: number): number {
  if (val < 1) return 0;
  let a = 0;
  let b = 1;
  while (b <= val) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return a;
}

// Extracted logic for reusability and testing
export function calculateCartMetrics(inputs: {
  baseTotal: number;
  markupRate: number; // Changed to percentage
  disposableFees: number;
  gstRate: number;
  pstRate: number;
  subsidyAmount: number;
}) {
  // 1. Math in standard decimal format
  const markup = inputs.baseTotal * (inputs.markupRate / 100);
  const sellingSubtotal = inputs.baseTotal + markup;
  const taxableAmount = sellingSubtotal + inputs.disposableFees;

  const totalGST = taxableAmount * (inputs.gstRate / 100);
  const totalPST = taxableAmount * (inputs.pstRate / 100);
  const totalTax = totalGST + totalPST;

  const grossTotal = taxableAmount + totalTax;
  const subsidyUsed = Math.min(inputs.subsidyAmount, grossTotal); // Can't subsidize more than the cart costs
  const finalTotal = grossTotal - subsidyUsed;

  // 2. Fibonacci Subsidy Generation (15% of the Fibonacci floor of Gross Total)
  const fibFloor = getFibonacciFloor(grossTotal);
  const subsidyGenerated = fibFloor * 0.15;

  // 3. Convert to cents for MongoDB storage
  const toCents = (val: number) => Math.round(val * 100);

  return {
    dollars: {
      markup,
      sellingSubtotal,
      taxableAmount,
      totalGST,
      totalPST,
      totalTax,
      grossTotal,
      subsidyUsed,
      finalTotal,
      fibFloor,
      subsidyGenerated,
    },
    cents: {
      baseTotal: toCents(inputs.baseTotal),
      markup: toCents(markup),
      disposableFees: toCents(inputs.disposableFees),
      totalGST: toCents(totalGST),
      totalPST: toCents(totalPST),
      totalTax: toCents(totalTax),
      grossTotal: toCents(grossTotal),
      subsidyUsed: toCents(subsidyUsed),
      finalTotal: toCents(finalTotal),
      subsidyGenerated: toCents(subsidyGenerated),
    },
  };
}

async function main() {
  console.log("--- Cart Math Calculator ---");
  const baseTotal = await ask("Base Total ($): ");
  const markupRate = await ask("Markup Rate (%): "); // Changed prompt
  const disposableFees = await ask("Total Disposable Fees ($): ");
  const gstRate = await ask("GST Rate (%): ");
  const pstRate = await ask("PST Rate (%): ");
  const subsidyAmount = await ask("Available Subsidy ($): ");

  const metrics = calculateCartMetrics({
    baseTotal,
    markupRate,
    disposableFees,
    gstRate,
    pstRate,
    subsidyAmount,
  });

  console.log("\n=== SUMMARY (HUMAN READABLE) ===");
  console.log(`Base Total:         $${baseTotal.toFixed(2)}`);
  console.log(`Markup (${markupRate}%):       $${metrics.dollars.markup.toFixed(2)}`);
  console.log(`Selling Subtotal:   $${metrics.dollars.sellingSubtotal.toFixed(2)}`);
  console.log(`Taxable Amount (Disp. fee):     $${metrics.dollars.taxableAmount.toFixed(2)}`);
  console.log(`GST (${gstRate}%):          $${metrics.dollars.totalGST.toFixed(2)}`);
  console.log(`PST (${pstRate}%):          $${metrics.dollars.totalPST.toFixed(2)}`);
  console.log(`Gross Total:        $${metrics.dollars.grossTotal.toFixed(2)}`);
  console.log(`Subsidy Applied:   -$${metrics.dollars.subsidyUsed.toFixed(2)}`);
  console.log(`--------------------------------`);
  console.log(`FINAL TOTAL:        $${metrics.dollars.finalTotal.toFixed(2)}`);

  console.log("\n=== SUBSIDY GENERATION ===");
  console.log(`Fibonacci Floor:    ${metrics.dollars.fibFloor}`);
  console.log(`Generated (15%):    $${metrics.dollars.subsidyGenerated.toFixed(2)}`);

  console.log("\n=== DATABASE VALUES (IN CENTS) ===");
  console.log(`BaseTotal:          ${metrics.cents.baseTotal}`);
  console.log(`Markup:             ${metrics.cents.markup}`);
  console.log(`DisposableFee:      ${metrics.cents.disposableFees}`);
  console.log(`TotalGST:           ${metrics.cents.totalGST}`);
  console.log(`TotalPST:           ${metrics.cents.totalPST}`);
  console.log(`TotalTax:           ${metrics.cents.totalTax}`);
  console.log(`susbsidyUsed:       ${metrics.cents.subsidyUsed}`);
  console.log(`cartTotal:          ${metrics.cents.finalTotal}`);
  console.log(`grossTotal:         ${metrics.cents.grossTotal}`);
  console.log(`subsidyGenerated:   ${metrics.cents.subsidyGenerated}`);

  rl.close();
}

main();