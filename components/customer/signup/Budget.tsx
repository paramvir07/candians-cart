import { DollarSign, TrendingUp } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useAtom, useSetAtom } from "jotai";
import { budgetAtom, stepAtom } from "@/atoms/customer/signUp";

const QUICK_AMOUNTS = [300, 500, 750, 1000];

const Budget = () => {
  const minBudget = 300;
  const [budget, setBudget] = useAtom(budgetAtom);
  const setStep = useSetAtom(stepAtom);

  const numBudget = Number(budget);
  const isValid = budget && numBudget >= minBudget;
  const showError = numBudget > 0 && numBudget < minBudget;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Monthly Grocery Budget</h2>
        <p className="text-muted-foreground text-sm">
          What's your estimated monthly spend on groceries?
        </p>
      </div>

      <div className="w-full space-y-3">
        {/* Quick select chips */}
        <div className="flex gap-2 flex-wrap justify-center">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setBudget(String(amount))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
                numBudget === amount
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative group">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
          <Input
            type="number"
            placeholder="Or enter a custom amount"
            className="pl-10 h-11 text-sm focus:border-primary transition-all"
            value={budget}
            required
            min={minBudget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {/* Error / helper */}
        <div className="h-4">
          {showError ? (
            <p className="text-xs text-destructive">
              Minimum budget is ${minBudget}/month
            </p>
          ) : isValid ? (
            <p className="text-xs text-emerald-500">
              Looks good! You're all set.
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          size="lg"
          onClick={() => setStep("selectStore")}
          className="w-full h-11 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          disabled={!isValid}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};

export default Budget;
