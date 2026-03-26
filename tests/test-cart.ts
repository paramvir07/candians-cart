// npx tsx tests/test-cart.ts

/*
New subsidy logic (Fibonacci bracket system):

1. Cart total must be >= $21 for any subsidy
2. Fib bracket determines the active markup rate:
   - Between prev and mid  → use avg markup of items in cart
   - Between mid and current → fixed 30% markup
3. Subsidy = 60% of the recalculated markup using active markup rate

Example (prev=21, mid=28, current=34, cart=$25, avgMarkup=35%):
  Base Price   = $20.00
  Active Markup (35%) = $7.00
  Cart Total   = $27.00
  Subsidy (60% of markup) = $7.00 * 0.60 = $4.20
  Customer Pays = $27.00 - $4.20 = $22.80
*/

import * as readline from "readline";
import { TaxRate } from "../types/store/products.types";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<number> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const parsed = Number(answer);
      resolve(isNaN(parsed) ? 0 : parsed);
    });
  });
}

function getFibBracketFrom21(value: number) {
  let a = 13, b = 21;
  while (b < value) { const next = a + b; a = b; b = next; }
  const mid = value >= 21 ? Math.round((a + b) / 2) : undefined;
  return { prev: a, current: b, mid };
}

export function calculateCartMetrics(inputs: {
  baseTotal: number;       // dollars
  avgMarkupRate: number;   // e.g. 35 for 35% — avg across non-subsidised items
  taxRate: TaxRate;
  disposableFees: number;
}) {
  const { prev, current, mid } = getFibBracketFrom21(inputs.baseTotal);

  // Determine active markup rate based on fib zone
  let activeMarkupRate: number | null = null;
  if (prev >= 21 && inputs.baseTotal >= prev && inputs.baseTotal < (mid ?? Infinity)) {
    activeMarkupRate = inputs.avgMarkupRate;
  } else if (mid && inputs.baseTotal >= mid && inputs.baseTotal <= current) {
    activeMarkupRate = 30;
  }

  const markup = activeMarkupRate !== null
    ? inputs.baseTotal * (activeMarkupRate / 100)
    : inputs.baseTotal * (inputs.avgMarkupRate / 100);

  const tax = inputs.baseTotal * inputs.taxRate;
  const grossTotal = inputs.baseTotal + markup + tax + inputs.disposableFees;

  // Always 60% of markup when in a valid zone
  const subsidyRate = activeMarkupRate !== null ? 0.6 : 0;
  const subsidyUsed = markup * subsidyRate;
  const finalTotal = grossTotal - subsidyUsed;

  const toCents = (val: number) => Math.round(val * 100);

  return {
    zone: activeMarkupRate !== null
      ? inputs.baseTotal < (mid ?? Infinity)
        ? `prev→mid (avg markup ${inputs.avgMarkupRate}%)`
        : `mid→current (fixed 30%)`
      : "outside subsidy range",
    fibBracket: { prev, mid, current },
    dollars: { baseTotal: inputs.baseTotal, markup, tax, grossTotal, subsidyUsed, finalTotal, activeMarkupRate },
    cents: {
      baseTotal:     toCents(inputs.baseTotal),
      markup:        toCents(markup),
      tax:           toCents(tax),
      disposableFees:toCents(inputs.disposableFees),
      grossTotal:    toCents(grossTotal),
      subsidyUsed:   toCents(subsidyUsed),
      finalTotal:    toCents(finalTotal),
    },
  };
}

async function main() {
  console.log("--- Fibonacci Bracket Cart Calculator ---");

  const baseTotal     = await ask("Base Total ($): ");
  const avgMarkupRate = await ask("Avg Markup Rate of items (%): ");
  const taxInput      = await ask("Tax Rate (0, 0.05, 0.07, 0.12): ");
  const disposableFees = await ask("Total Disposable Fees ($): ");

  const taxRate = taxInput as TaxRate;
  const metrics = calculateCartMetrics({ baseTotal, avgMarkupRate, taxRate, disposableFees });
  const { dollars, cents } = metrics;

  console.log("\n=== FIB BRACKET ===");
  console.log(`Prev: $${metrics.fibBracket.prev} | Mid: $${metrics.fibBracket.mid ?? "N/A"} | Current: $${metrics.fibBracket.current}`);
  console.log(`Zone: ${metrics.zone}`);
  console.log(`Active Markup Rate: ${dollars.activeMarkupRate ?? "none"}%`);

  console.log("\n=== SUMMARY (DOLLARS) ===");
  console.log(`Base Price:       $${dollars.baseTotal.toFixed(2)}`);
  console.log(`Markup:           $${dollars.markup.toFixed(2)}`);
  console.log(`Tax:              $${dollars.tax.toFixed(2)}`);
  console.log(`Disposable Fees:  $${disposableFees.toFixed(2)}`);
  console.log(`--------------------------------`);
  console.log(`Gross Total:      $${dollars.grossTotal.toFixed(2)}`);

  if (dollars.subsidyUsed > 0) {
    console.log(`Subsidy (60% MU): -$${dollars.subsidyUsed.toFixed(2)}`);
  } else {
    console.log(`Subsidy:          $0.00 (outside subsidy range)`);
  }

  console.log(`--------------------------------`);
  console.log(`CUSTOMER PAYS:    $${dollars.finalTotal.toFixed(2)}`);

  console.log("\n=== VERIFICATION ===");
  const checkTotal   = Number((dollars.finalTotal + dollars.subsidyUsed).toFixed(2));
  const expectedTotal = Number(dollars.grossTotal.toFixed(2));
  console.log(checkTotal === expectedTotal ? "Verification Success ✅" : "Verification Failed ❌");
  console.log(`Pay + Subsidy: $${checkTotal.toFixed(2)} (Target: $${expectedTotal.toFixed(2)})`);

  console.log("\n=== DATABASE (CENTS) ===");
  console.log(`cartTotal:    ${cents.finalTotal}`);
  console.log(`subsidyUsed:  ${cents.subsidyUsed}`);
  console.log(`grossTotal:   ${cents.grossTotal}`);

  rl.close();
}

main();