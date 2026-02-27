"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";
import { stepAtom } from "@/atoms/customer/signUp";
import { useAtom } from "jotai";
import { StoreDocument } from "@/types/store/store";
import Location from "./Location";
import Terms from "./Terms";
import StoreSelected from "./StoreSelected";
import Budget from "./Budget";
import SelectStore from "./SelectStore";
import { SignupForm } from "@/components/auth/signup-form";
import { ReferralCodeForm } from "./ReferralCodeForm";

const STEPS = ["location", "terms", "budget", "selectStore", "code"];

const STEP_LABELS: Record<string, string> = {
  location: "Location",
  terms: "Terms",
  budget: "Budget",
  selectStore: "Store",
  code: "Code",
};

const SignupClient = ({ stores }: { stores: StoreDocument[] }) => {
  const [step, setStep] = useAtom(stepAtom);

  const handleBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1] as typeof step);
  };

  const currentStepIndex = STEPS.indexOf(step);

  // if (step === "signUpForm") return <SignupForm userRole="customer" />;

  return (
    <main className="min-h-screen w-full font-headline overflow-hidden relative flex flex-col items-center justify-center px-4 py-10">
      {/* Animated background */}
      {step === "signUpForm" ? <SignupForm userRole="customer" /> : (<div>
      <div className="absolute inset-0 bg-background -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 15% 15%, hsl(var(--primary)/0.18) 0%, transparent 45%),
              radial-gradient(ellipse at 85% 85%, hsl(var(--accent)/0.15) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 100%, hsl(var(--primary)/0.08) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <StoreSelected />

      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl scale-150" />
            <div className="relative bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Welcome to{" "}
              <span className="text-primary relative">
                Canadian&apos;s Cart
                <span className="absolute -bottom-1 left-0 right-0 h-0.75 rounded-full bg-primary/40" />
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              The exclusive family-only grocery delivery platform.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        {currentStepIndex >= 0 && (
          <div className="w-full animate-in fade-in-0 duration-500 delay-100">
            <div className="flex items-center justify-between px-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        i < currentStepIndex
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : i === currentStepIndex
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg shadow-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < currentStepIndex ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium transition-colors ${
                        i <= currentStepIndex
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0. mx-1 mb-4 rounded-full transition-all duration-500 ${
                        i < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="w-full shadow-2xl animate-in fade-in-0 slide-in-from-bottom-6 duration-500 delay-150 bg-card/80 backdrop-blur-xl border border-border/60">
          <CardContent className="pt-6 pb-8 px-5 sm:px-8">
            <div className="flex flex-col items-center space-y-5">
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
                <div className="text-destructive py-4">
                  Something went wrong
                </div>
              )}

              {step !== "location" && (
                <div className="flex items-center gap-3 pt-2 w-full justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                  <span className="text-muted-foreground/40 text-xs">|</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("location")}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex flex-col items-center gap-2 text-sm animate-in fade-in-0 duration-500 delay-300">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">
              Already have an account?
            </span>
            <Link
              href="/customer/login"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
            >
              Login here.
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Are you a store?</span>
            <Link
              href="/store/login"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
            >
              Login here.
            </Link>
          </div>
        </div>
        </div>
        </div>)}
    </main>
  );
};

export default SignupClient;
