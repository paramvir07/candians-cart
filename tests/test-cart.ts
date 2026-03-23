// npx tsx tests/test-cart.ts

/*
new logic for subsidy,

only give subsidy when min amount is 21 dollars, subsidy of 60% on markup

for example (When no Tax) -:

Base Price = 23.38
Markup (35%) = 8.18

cart total becomes = 31.56

subsidy (we give 60% of markup) = 8.18 * 0.60 = 4.91

Customer Pays = Cart Total - Subsidy = 31.56 - 4.91 = 26.65

Verification = Customer Pays + Subsidy = 26.65 + 4.91 = 31.56

Example 2 (with tax)

Base Price = 23.38
Lets say 5% tax on all items so it becomes = 23.38 * 0.05 = 1.17
Markup = (35% on all) = 8.18

Cart total = BP + Markup + Tax = 23.38 + 8.18 + 1.17 = 32.73

subsidy (60% of markup) = 8.18 * 0.60 = 4.91

Customer pays = CT - subsidy = 32.73 - 4.91 = 27.82


when cart total = 144 to 232 (45% subsidy on markup)
when cart total = 233 to 376 (40% subsidy on markup)
when cart total = above 376 (40 % subsidy on markup)
*/
import * as readline from "readline";
import { TaxRate } from "../types/store/products.types"; // Reusing existing types

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

/**
 * Tiered Subsidy Logic:
 * 1. Gross < $21.00: 0% Subsidy.
 * 2. Gross $21.00 - $143.99: 60% of Markup.
 * 3. Gross $144.00 - $232.99: 45% of Markup.
 * 4. Gross $233.00 and above: 40% of Markup.
 */
export function calculateCartMetrics(inputs: {
  baseTotal: number;
  markupRate: number; // e.g., 35 for 35%
  taxRate: TaxRate; // Reusing TaxRate type
  disposableFees: number;
}) {
  // 1. Calculate Core Components
  const markup = inputs.baseTotal * (inputs.markupRate / 100);
  const tax = inputs.baseTotal * inputs.taxRate;

  // Gross Total = Base Price + Markup + Tax + Disposable Fees
  const grossTotal = inputs.baseTotal + markup + tax + inputs.disposableFees;

  // 2. Apply Tiered Subsidy Logic (Early Exit/Tiered assignment)
  let subsidyRate = 0;

  if (grossTotal >= 233.0) {
    subsidyRate = 0.4;
  } else if (grossTotal >= 144.0) {
    subsidyRate = 0.45;
  } else if (grossTotal >= 21.0) {
    subsidyRate = 0.6;
  }

  const subsidyUsed = markup * subsidyRate;
  const finalTotal = grossTotal - subsidyUsed;

  // 3. Conversion to Cents for MongoDB (Ensures precision for financial data)
  const toCents = (val: number) => Math.round(val * 100);

  return {
    dollars: {
      baseTotal: inputs.baseTotal,
      markup,
      tax,
      grossTotal,
      subsidyUsed,
      finalTotal,
      subsidyPercentage: subsidyRate * 100,
    },
    cents: {
      baseTotal: toCents(inputs.baseTotal),
      markup: toCents(markup),
      tax: toCents(tax),
      disposableFees: toCents(inputs.disposableFees),
      grossTotal: toCents(grossTotal),
      subsidyUsed: toCents(subsidyUsed),
      finalTotal: toCents(finalTotal),
    },
  };
}

async function main() {
  console.log("--- Tiered Cart Math Calculator ---");

  const baseTotal = await ask("Base Total ($): ");
  const markupRate = await ask("Markup Rate (%): ");
  const taxInput = await ask("Tax Rate (0, 0.05, 0.07, 0.12): ");
  const disposableFees = await ask("Total Disposable Fees ($): ");

  // Cast input to TaxRate type to maintain type safety
  const taxRate = taxInput as TaxRate;

  const metrics = calculateCartMetrics({
    baseTotal,
    markupRate,
    taxRate,
    disposableFees,
  });

  const { dollars, cents } = metrics;

  console.log("\n=== SUMMARY (DOLLARS) ===");
  console.log(`Base Price:       $${dollars.baseTotal.toFixed(2)}`);
  console.log(`Markup:           $${dollars.markup.toFixed(2)}`);
  console.log(`Tax:              $${dollars.tax.toFixed(2)}`);
  console.log(`Disposable Fees:  $${disposableFees.toFixed(2)}`);
  console.log(`--------------------------------`);
  console.log(`Gross Total:      $${dollars.grossTotal.toFixed(2)}`);

  if (dollars.subsidyUsed > 0) {
    console.log(
      `Subsidy (${dollars.subsidyPercentage}% MU): -$${dollars.subsidyUsed.toFixed(2)}`,
    );
  } else {
    console.log(`Subsidy:          $0.00 (Below $21.00 Threshold)`);
  }

  console.log(`--------------------------------`);
  console.log(`CUSTOMER PAYS:    $${dollars.finalTotal.toFixed(2)}`);

  console.log("\n=== VERIFICATION ===");
  const checkTotal = Number(
    (dollars.finalTotal + dollars.subsidyUsed).toFixed(2),
  );
  const expectedTotal = Number(dollars.grossTotal.toFixed(2));

  if (checkTotal !== expectedTotal) {
    console.log("verification Failed ❌");
  } else {
    console.log("verification Success ✅");
  }

  console.log(
    `Pay + Subsidy:    $${checkTotal.toFixed(2)} (Target: $${expectedTotal.toFixed(2)})`,
  );

  console.log("\n=== DATABASE (CENTS) ===");
  console.log(`cartTotal:        ${cents.finalTotal}`);
  console.log(`subsidyUsed:      ${cents.subsidyUsed}`);
  console.log(`grossTotal:       ${cents.grossTotal}`);

  rl.close();
}

main();
