"use client";

import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
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
import Image from "next/image";

const STEPS = ["location", "terms", "budget", "selectStore", "code"] as const;

const STEP_META: Record<string, { label: string; description: string }> = {
  location:    { label: "Location",      description: "Find stores near you"     },
  terms:       { label: "Terms",         description: "Review our policies"      },
  budget:      { label: "Budget",        description: "Set your monthly spend"   },
  selectStore: { label: "Store",         description: "Pick your grocery store"  },
  code:        { label: "Referral Code", description: "Enter your invite code"   },
};

const STEP_TITLES: Record<string, string> = {
  location:    "Where are you located?",
  terms:       "Review & Accept Terms",
  budget:      "Monthly Grocery Budget",
  selectStore: "Choose Your Store",
  code:        "Enter Referral Code",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  location:    "Select your city to find available stores near you.",
  terms:       "Please read our policies before continuing.",
  budget:      "What's your estimated monthly spend on groceries?",
  selectStore: "Select the nearest grocery store to get started.",
  code:        "You'll need a referral code from an existing family member.",
};

const SignupClient = ({ stores }: { stores: StoreDocument[] }) => {
  const [step, setStep] = useAtom(stepAtom);

  const handleBack = () => {
    const idx = STEPS.indexOf(step as typeof STEPS[number]);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const currentStepIndex = STEPS.indexOf(step as typeof STEPS[number]);

  if (step === "signUpForm") {
    return (
      <main className="min-h-screen w-full flex items-center justify-center lg:p-8 bg-muted/30">
        <SignupForm userRole="customer" />
      </main>
    );
  }

  const stepContent = (
    <>
      {step === "location"    ? <Location /> :
       step === "terms"       ? <Terms /> :
       step === "budget"      ? <Budget /> :
       step === "selectStore" ? <SelectStore stores={stores} /> :
       step === "code"        ? <ReferralCodeForm /> :
       <div className="text-destructive text-sm py-4">Something went wrong</div>}
    </>
  );

  return (
    <main className="w-full min-h-screen">
      <StoreSelected />

      {/* ── MOBILE: image top, frosted card bottom ── */}
      <div className="flex flex-col lg:hidden h-svh overflow-hidden">

        {/* Top image */}
        <div className="relative w-full h-[42vh] shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80"
            alt="Fresh produce"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

          {/* Logo on image */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart size={22} className="text-primary-foreground" />
            </div>
          </div>

          {/* Mobile step counter on image */}
          <div className="absolute top-5 right-5">
            <span className="text-xs text-white/80 font-medium bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
              Step {currentStepIndex + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Frosted glass form card */}
        <div className="relative z-10 -mt-8 flex-1 overflow-y-auto
          bg-background/85 backdrop-blur-2xl
          rounded-t-3xl px-5 pt-6 pb-8
          shadow-[0_-8px_40px_rgba(0,0,0,0.12)]
          border-t border-x border-white/20
          ring-1 ring-inset ring-white/10"
        >
          {/* Mobile step dots */}
          <div className="flex items-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                i === currentStepIndex ? "w-6 bg-primary"
                : i < currentStepIndex ? "w-4 bg-primary/50"
                : "w-4 bg-muted"
              }`} />
            ))}
          </div>

          {/* Step heading */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
              {STEP_META[STEPS[currentStepIndex] ?? "location"]?.label}
            </p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {STEP_TITLES[step]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {STEP_DESCRIPTIONS[step]}
            </p>
          </div>

          {/* Step content */}
          <div className="flex-1 min-h-[200px]">
            {stepContent}
          </div>

          {/* Bottom nav */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">
                Have an account?{" "}
                <Link href="/customer/login" className="text-primary hover:underline font-medium">Login</Link>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {step !== "location" && (
                <Button variant="ghost" size="sm" onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground h-8 px-2">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                </Button>
              )}
              {step !== "location" && (
                <Button variant="ghost" size="sm" onClick={() => setStep("location")}
                  className="text-muted-foreground hover:text-foreground text-xs h-8">
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: centered card, sidebar left, content right ── */}
      <div className="hidden lg:flex items-center justify-center w-full min-h-screen bg-muted/30 p-8">
        <div className="flex w-full max-w-4xl xl:max-w-5xl h-[680px] xl:h-[720px] rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">

          {/* LEFT SIDEBAR — fixed width, full height */}
          <div className="flex flex-col w-[280px] xl:w-[300px] shrink-0 bg-card border-r border-border p-8">

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20">
                <ShoppingCart size={17} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">CanadianCart</span>
            </div>

            {/* Step list */}
            <nav className="flex flex-col gap-0 flex-1">
              {STEPS.map((s, i) => {
                const isDone   = i < currentStepIndex;
                const isActive = i === currentStepIndex;

                return (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                        isDone   ? "bg-primary text-primary-foreground" :
                        isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                                   "bg-muted border border-border text-muted-foreground"
                      }`}>
                        {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-px flex-1 my-1.5 min-h-[32px] rounded-full transition-all duration-500 ${
                          isDone ? "bg-primary" : "bg-border"
                        }`} />
                      )}
                    </div>

                    <div className="pb-7 pt-0.5 min-w-0">
                      <p className={`text-sm font-semibold leading-tight transition-colors ${
                        isActive ? "text-foreground" : isDone ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {STEP_META[s].label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {STEP_META[s].description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Footer links */}
            <div className="flex flex-col gap-1.5 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Have an account?{" "}
                <Link href="/customer/login" className="text-primary hover:underline font-medium">Login</Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Are you a store?{" "}
                <Link href="/store/login" className="text-primary hover:underline font-medium">Login here</Link>
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT — fills remaining space */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Top bar */}
            <div className="flex items-center justify-between px-12 xl:px-16 pt-8 pb-0 shrink-0">
              {step !== "location" ? (
                <Button variant="ghost" size="sm" onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground -ml-2">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
              ) : <div />}
              <span className="text-xs text-muted-foreground font-medium">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
            </div>

            {/* Main content area — centered vertically */}
            <div className="flex-1 flex flex-col justify-center px-12 xl:px-16 py-8 overflow-y-auto">

              {/* Step heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
                  {STEP_META[STEPS[currentStepIndex] ?? "location"]?.label}
                </p>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {STEP_TITLES[step]}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {STEP_DESCRIPTIONS[step]}
                </p>
              </div>

              {/* Step content */}
              <div className="w-full max-w-lg min-h-[220px]">
                {stepContent}
              </div>
            </div>

            {/* Bottom bar */}
            {step !== "location" && (
              <div className="shrink-0 px-12 xl:px-16 py-5 border-t border-border flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setStep("location")}
                  className="text-muted-foreground hover:text-foreground text-xs">
                  Start Over
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>

    </main>
  );
};

export default SignupClient;