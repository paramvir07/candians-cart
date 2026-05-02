"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth/login-logout.actions";
import { Spinner } from "../ui/spinner";
import { UserRole } from "@/types/auth";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Image from "next/image";
import { IFormActionResponse } from "@/types/form";
import Logo from "../shared/Logo";

const initialState: IFormActionResponse = {
  success: false,
  message: "",
};

type loginProps = React.ComponentProps<"div"> & { userRole: UserRole };

export function LoginForm({ userRole, className, ...props }: loginProps) {
  const customer = userRole === "customer";
  const admin = userRole === "admin";
  const store = userRole === "store";
  const cashier = userRole === "cashier";

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

useEffect(() => {
  if (!state.message) return;

  if (state.success) {
    toast.success(state.message);
    router.push(state.redirectTo || "/customer");
  } else {
    toast.error(state.message);
    if (state.redirectTo) {
      setTimeout(() => router.push(state.redirectTo!), 2000);
    }
  }
}, [state, router]);

  const title = store
    ? "Login to your store account"
    : admin
      ? "Login to your admin account"
      : cashier
        ? "Login to your cashier account"
        : "Login to your account";

  const formContent = (
    <>
      {/* Logo */}
      <div className="mb-8">
        <div className="h-12 flex items-center justify-left mb-6">
          <Logo variant="full" href="/" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials below to sign in
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="role" value={userRole} />
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
          className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="h-12 rounded-xl border-border bg-background px-4 pr-11 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            variant="ghost"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all mt-1 flex items-center justify-center"
        >
          {isPending ? <Spinner /> : "Log in"}
        </Button>
      </form>

      {/* Footer links */}
      <div className="mt-6 flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </p>
        {customer && (
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/customer/signup"
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        )}
        {!customer && (
          <p className="text-sm text-muted-foreground">
            Are you a Customer?{" "}
            <Link
              href="/customer/login"
              className="text-primary hover:underline"
            >
              Login here
            </Link>
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE layout: image top, form slides up from bottom ── */}
      <div className={cn("flex flex-col w-full lg:hidden min-h-screen overflow-hidden", className)} {...props}>

        {/* Top image */}
        <div className="relative w-full h-[52vh] shrink-0">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
            alt="Fresh groceries"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-black/40"></div>
        </div>
                  {/* soft bottom fade into card */}
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Form card — overlaps image slightly */}
        <div className="relative z-10 -mt-45 flex-1 bg-background rounded-t-3xl px-6 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          {formContent}
        </div>
      </div>

      {/* ── DESKTOP layout: plain, no image (handled by page carousel) ── */}
      <div className={cn("hidden lg:block w-full max-w-sm", className)} {...props}>
        {formContent}
      </div>
    </>
  );
}