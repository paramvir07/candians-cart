import Link from "next/link";
import { Card, CardContent, CardFooter } from "../../ui/card";
import { Button } from "../../ui/button";
import { CheckCircle } from "lucide-react";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";

const Terms = () => {
  const setStep = useSetAtom(stepAtom);
  return (
    <>
      <p className="text-muted-foreground">
        Please review and accept our terms to continue.
      </p>
      <Card className="w-full max-w-sm text-left">
        <CardContent className="max-h-32 overflow-y-auto text-xs space-y-2 text-muted-foreground">
          <p>
            Welcome to Candian's Cart. By using our service, you agree to these
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
            the link below.
          </p>
        </CardContent>
        <CardFooter className="border-t flex-col items-start gap-2">
          <Link
            href="/terms-and-conditions"
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            Read full terms and conditions
          </Link>
          <Link
            href="/advertising-policy"
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            Advertising & Usage Policy for Partners
          </Link>
          <Link
            href="/community-support-policy"
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            Community Support & Product Launch Policy
          </Link>
        </CardFooter>
      </Card>
      <Button size="lg" onClick={() => setStep("budget")} className="w-full">
        <CheckCircle className="mr-2" />
        Accept & Continue
      </Button>
    </>
  );
};

export default Terms;
