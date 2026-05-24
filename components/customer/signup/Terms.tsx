import Link from "next/link";
import { Button } from "../../ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";
import { useState } from "react";

const POLICY_LINKS = [
  { href: "/terms", label: "Terms of Service", key: "terms" },
  { href: "/privacy", label: "Privacy Policy", key: "privacy" },
];

const Terms = () => {
  const setStep = useSetAtom(stepAtom);
  const [checked, setChecked] = useState({ terms: false, privacy: false });

  const allChecked = checked.terms && checked.privacy;

  const toggle = (key: "terms" | "privacy") =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="w-full space-y-4">
      {/* Terms text */}
      <div className="w-full rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
<div className="px-4 py-3.5 text-xs text-muted-foreground leading-relaxed space-y-2">
  <p>
    By using Canadian&apos;s Cart, you agree to our Terms of Service and Privacy
    Policy.
  </p>

  <p>
    Your selected store is generally final after registration.
  </p>

  <p>
    Subsidies and promotions may have eligibility rules or limits.
  </p>

    <p className="text-[12px] font-semibold">
    Please review the Terms of Service and Privacy Policy below.
  </p>
</div>

        {/* Policy links with checkboxes */}
        <div className="border-t border-border/60 px-4 py-3 space-y-2 bg-card/40">
          {POLICY_LINKS.map(({ href, label, key }) => (
            <div key={key} className="flex items-center gap-3 py-0.5">
              <input
                type="checkbox"
                id={key}
                checked={checked[key as "terms" | "privacy"]}
                onChange={() => toggle(key as "terms" | "privacy")}
                className="h-3.5 w-3.5 rounded accent-primary cursor-pointer shrink-0"
              />
              <label
                htmlFor={key}
                className="flex items-center justify-between flex-1 text-xs text-muted-foreground cursor-pointer"
              >
                <span>
                  I have read the{" "}
                  <Link
                    href={href}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="underline font-semibold text-blue-500 underline-offset-4 hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {label}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => setStep("budget")}
        disabled={!allChecked}
        className="w-full h-11 rounded-full font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Continue
      </Button>
    </div>
  );
};

export default Terms;
