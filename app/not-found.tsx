"use client";

import Lottie from "lottie-react";
import ErrorAnimation from "@/public/animations/404.json";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-2">
        {/* <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"> */}
          <Logo variant="full" />
        {/* </div> */}
        {/* <span className="text-base font-bold text-foreground tracking-tight"> */}
          {/* Candian&apos;s Cart */}
        {/* </span> */}
      </div>

      {/* 404 Lottie */}
      <Lottie
        animationData={ErrorAnimation}
        loop
        autoplay
        className="w-94 md:w-120 sm:w-80 sm:h-80"
      />

      {/* Text */}
      <div className="flex flex-col gap-1.5 -mt-2">
        <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Looks like this page wandered off the shelf. Let&apos;s get you back.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="mt-2 flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-85 active:scale-[0.98] transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

    </div>
  );
};

export default NotFound;