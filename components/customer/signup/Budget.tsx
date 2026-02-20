import { DollarSign } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useAtom, useSetAtom } from "jotai";
import { budgetAtom, stepAtom } from "@/atoms/customer/signUp";

const Budget = () => {
  const minBudget = 50;
  const [budget, setBudget] = useAtom(budgetAtom);
  const setStep = useSetAtom(stepAtom);
  return (
    <>
      <p className="text-muted-foreground">
        What is your estimated monthly grocery budget?
      </p>

      <div className="w-full max-w-sm space-y-3">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="e.g., 500"
            className="pl-10 h-12 text-base"
            value={budget}
            required
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <p
          className={`text-sm text-left text-red-500 transition-opacity ${
            Number(budget) > 0 && Number(budget) < minBudget
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          Minimum budget is ${minBudget}
        </p>
        <Button
          type="submit"
          size="lg"
          onClick={() => {
            setStep("selectStore");
          }}
          className="w-full"
          disabled={!budget || Number(budget) < minBudget}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

export default Budget;
