"use client"

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
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth/auth.actions";
import { Spinner } from "../ui/spinner";

const initialState = {
  success: false,
  message: "",
};

export function LoginForm({
  role,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        role === "customer"
          ? redirect("/customer/profile")
          : role === "store"
            ? redirect("/store")
            : redirect("/admin");
      } else {
        toast.error(state.message);
      }
    }
  }, [state.message, state.success]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" name="password" required />
              </Field>
              <Field>
                <Button type="submit">
                  {isPending ? <Spinner /> : "Login"}
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                {role === "customer" && (
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/customer/signup">Sign up</Link>
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
