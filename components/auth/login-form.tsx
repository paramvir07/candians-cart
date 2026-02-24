"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth/login-logout.actions";
import { Spinner } from "../ui/spinner";
import { UserRole } from "@/types/auth";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState = {
  success: false,
  message: "",
};

type loginProps = React.ComponentProps<"div"> & { userRole: UserRole };
export function LoginForm({ userRole, className, ...props }: loginProps) {
  const customer = userRole === "customer";
  const admin = userRole === "admin";
  const store = userRole === "store";

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        customer
          ? router.push("/")
          : store
            ? router.push("/store")
            : admin
              ? router.push("/admin")
              : router.push("/customer/login");
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-center items-center gap-3">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit group">
              <ShoppingCart
                className="transition-transform group-hover:scale-110"
                size={35}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <CardTitle>
                {store
                  ? "Login to your store account"
                  : admin
                    ? "Login to your admin account"
                    : "Login to your account"}
              </CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password *</FieldLabel>
                <div style={{ position: "relative" }}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-0 cursor-pointer text-sm"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field>
                <Button type="submit">
                  {isPending ? <Spinner /> : "Login"}
                </Button>
                {/* <Button variant="outline" type="button">
                  Login with Google
                </Button> */}
                {customer && (
                  <FieldDescription className="text-center">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <div className="text-sm flex justify-center items-center gap-1">
                        <div className="text-muted-foreground ">
                          Don&apos;t have an account?
                        </div>
                        <Link
                          href="/customer/signup"
                          className="text-primary font-bold"
                        >
                          Sign up
                        </Link>
                      </div>
                      <div className="text-sm flex justify-center items-center gap-1">
                        <div className="text-muted-foreground ">
                          Are you a store?
                        </div>
                        <Link
                          href="/store/login"
                          className="text-primary font-bold"
                        >
                          Login here.
                        </Link>
                      </div>
                    </div>
                  </FieldDescription>
                )}
                {store && (
                  <FieldDescription className="text-center">
                    <div className="text-sm flex justify-center items-center gap-1">
                      <div className="text-muted-foreground ">
                        Are you a customer?
                      </div>
                      <Link
                        href="/customer/login"
                        className="text-primary font-bold"
                      >
                        Login here.
                      </Link>
                    </div>
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
