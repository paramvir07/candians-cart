"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";
import { stepAtom } from "@/atoms/customer/signUp";
import { useAtom } from "jotai";
import { StoreDocument } from "@/types/store";
import Location from "./Location";
import Terms from "./Terms";
import StoreSelected from "./StoreSelected";
import Budget from "./Budget";
import SelectStore from "./SelectStore";
import { SignupForm } from "@/components/auth/signup-form";
import { ReferralCodeForm } from "./ReferralCodeForm";

const SignupClient = ({ stores }: { stores: StoreDocument[] }) => {
  const [step, setStep] = useAtom(stepAtom);

  const handleBack = () => {
    if (step === "terms") {
      setStep("location");
    } else if (step === "budget") {
      setStep("terms");
    } else if (step === "selectStore") {
      setStep("budget");
    } else if (step === "code") {
      setStep("selectStore");
    }
  };

  if (step === "signUpForm") return <SignupForm userRole="customer" />;

  return (
    <>
      <main className="min-h-screen w-full font-headline overflow-hidden relative">
        <div
          className="absolute inset-0 bg-background"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, hsl(var(--primary)/0.1), transparent 30%), radial-gradient(circle at 80% 90%, hsl(var(--accent)/0.1), transparent 30%)",
          }}
        />

        <StoreSelected />
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-4 relative z-10">
          <Card className="w-full max-w-lg text-center p-8 shadow-xl animate-in fade-in-0 slide-in-from-bottom-10 duration-700 bg-card/80 backdrop-blur-lg">
            <CardHeader>
              <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-fit mb-4 group">
                <ShoppingCart className="h-10 w-10 transition-transform group-hover:scale-110" />
              </div>
              <CardTitle className="font-headline text-5xl">
                Welcome to <span className="text-primary">Candian's Cart</span>
              </CardTitle>
              <p className="text-muted-foreground pt-2 text-lg">
                The exclusive family-only grocery delivery platform.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {step === "location" ? (
                  <Location />
                ) : step === "terms" ? (
                  <Terms />
                ) : step === "budget" ? (
                  <Budget />
                ) : step === "selectStore" ? (
                  <SelectStore stores={stores} />
                ) : step === "code" ? (
                  <ReferralCodeForm />
                ) : (
                  <div className="text-destructive">Something went wrong</div>
                )}
                {step !== "location" && (
                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      className="text-muted-foreground"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setStep("location")}
                      className="text-muted-foreground"
                    >
                      Start Over
                    </Button>
                  </div>
                )}
                {/* <p className="text-sm text-muted-foreground pt-2">
                Don't have a code?{" "}
                <Link
                  href="/family-sponsors"
                  className="text-primary underline"
                >
                  Find a sponsor family in your city
                </Link>
              </p> */}
              </div>
            </CardContent>
          </Card>
          <div className="mt-8">
            <Link
              href="/store/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Are you a store? Login here.
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignupClient;
