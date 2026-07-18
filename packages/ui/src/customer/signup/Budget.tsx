import { ChevronRight, DollarSign } from "lucide-react";
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
    <div className="w-full space-y-4">
      {/* Quick select chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setBudget(String(amount))}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${
              numBudget === amount
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="relative group">
        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Input
          type="number"
          placeholder="Or enter a custom amount"
          className="pl-10 h-11 rounded-xl text-sm border-border focus-visible:ring-1 focus-visible:ring-primary transition-all"
          value={budget}
          required
          min={minBudget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      {/* Validation message */}
      <div className="space-y-2 pb-2">
        {showError ? (
          <p className="text-xs text-destructive">
            Minimum budget is ${minBudget}/month
          </p>
        ) : isValid ? (
          <>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Looks good! You&apos;re all set.
            </p>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-primary shadow-sm">
              <span className="font-semibold">Note:</span> Staying consistent
              with your budget helps you earn the best possible profit sharing.
              Spending significantly less than your selected budget may reduce
              your rewards, so choose a realistic amount.
            </div>
          </>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={() => setStep("selectStore")}
        className="w-full h-11 mt-2 rounded-full font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-150"
        disabled={!isValid}
      >
        Continue
        <ChevronRight />
      </Button>
    </div>
  );
};

export default Budget;