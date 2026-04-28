import Link from "next/link";
import { Button } from "../../ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";

const POLICY_LINKS = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
];

const Terms = () => {
  const setStep = useSetAtom(stepAtom);

  return (
    <div className="w-full space-y-4">
      {/* Terms text */}
      <div className="w-full rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
        <div className="px-4 py-3.5 text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            Welcome to Candian&apos;s Cart. By using our service, you agree to
            these terms. You must provide a valid referral code to register.
          </p>
          <p>
            Our platform connects families for grocery shopping. We are not
            responsible for the quality of goods but will facilitate
            communication between users and vendors.
          </p>
          <p>
            Payments are processed securely. All personal information is handled
            as per our Privacy Policy. Full details are in the links below.
          </p>
        </div>

        {/* Policy links */}
        <div className="border-t border-border/60 px-4 py-3 space-y-2 bg-card/40">
          {POLICY_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              className="flex items-center justify-between group text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
            >
              <span className="group-hover:underline underline-offset-4">
                {label}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      <Button
        onClick={() => setStep("budget")}
        className="w-full h-11 rounded-full font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-150"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Accept & Continue
      </Button>
    </div>
  );
};

export default Terms;