import Link from "next/link";
import { Button } from "../../ui/button";
import { CheckCircle, ExternalLink, ScrollText } from "lucide-react";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";

const POLICY_LINKS = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/advertising-policy", label: "Advertising & Usage Policy" },
  {
    href: "/community-support-policy",
    label: "Community Support & Product Launch Policy",
  },
];

const Terms = () => {
  const setStep = useSetAtom(stepAtom);

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <ScrollText className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Review & Accept Terms</h2>
        <p className="text-muted-foreground text-sm">
          Please read before continuing.
        </p>
      </div>

      {/* Terms box */}
      <div className="w-full rounded-xl border border-border/60 overflow-hidden bg-muted/30">
        <div className="max-h-36 overflow-y-auto px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            Welcome to Canadian's Cart. By using our service, you agree to these
            terms. You must provide a valid referral code to register.
          </p>
          <p>
            Our platform connects families for grocery delivery. We are not
            responsible for the quality of goods but will facilitate
            communication between users and vendors.
          </p>
          <p>
            Payments are processed securely. All personal information is handled
            as per our Privacy Policy. You can find the full details by clicking
            the links below.
          </p>
        </div>

        {/* Policy links */}
        <div className="border-t border-border/60 px-4 py-3 space-y-2 bg-card/50">
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
        size="lg"
        onClick={() => setStep("budget")}
        className="w-full h-11 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Accept & Continue
      </Button>
    </div>
  );
};

export default Terms;
