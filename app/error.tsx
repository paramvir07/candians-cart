"use client";

import Lottie from "lottie-react";
import ErrorAnimation from "@/public/animations/503Error.json";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

const Error = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-2">
        <Logo variant="full" />
      </div>

      {/* 503 Lottie */}
      <Lottie
        animationData={ErrorAnimation}
        loop
        autoplay
        className="md:w-500 sm:w-80 sm:h-80"
      />

      {/* Text */}
      <div className="flex flex-col gap-1.5 -mt-2">
        <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Our servers hit a bump. Give it a moment and try again we&apos;re on
          it.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="mt-2 flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-85 active:scale-[0.98] transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
        Go to Main Page
      </Link>
    </div>
  );
};

export default Error;
