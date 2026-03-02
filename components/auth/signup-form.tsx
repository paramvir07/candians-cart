"use client";
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
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signupAction } from "@/actions/auth/signup.actions";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useAtom } from "jotai";
import {
  budgetAtom,
  referralCodeAtom,
  storeIdAtom,
} from "@/atoms/customer/signUp";
import SelectStore from "../customer/signup/SelectStore";
import { StoreDocument } from "@/types/store/store";
import StoreSelected from "../customer/signup/StoreSelected";
const initialState = {
  success: false,
  message: "",
};

type SignupFormProps = React.ComponentProps<typeof Card> & {
  userRole: UserRole;
  stores?: StoreDocument[];
};

export function SignupForm({ userRole, stores, ...props }: SignupFormProps) {
  //customer data
  const [budget] = useAtom(budgetAtom);
  const [storeId] = useAtom(storeIdAtom);
  const [referralCode] = useAtom(referralCodeAtom);

  const customer = userRole === "customer";
  const admin = userRole === "admin";
  const store = userRole === "store";
  const cashier = userRole === "cashier";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    signupAction.bind(null, userRole),
    initialState,
  );
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        customer
          ? router.push("/")
          : store || cashier || admin
            ? router.push("/admin")
            : router.push("/customer/login");
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card {...props}>
          <CardHeader>
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit group">
                <ShoppingCart
                  className="transition-transform group-hover:scale-110"
                  size={35}
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <CardTitle className="text-2xl">
                  {store
                    ? "Register a new store"
                    : admin
                      ? "Register a new admin"
                      : cashier
                        ? "Register a new cashier"
                        : "Create an account"}
                </CardTitle>
                <CardDescription className="text-center">
                  {store
                    ? "Enter new store information below to register a new store"
                    : admin
                      ? "Enter new admin information below to register a new admin"
                      : cashier
                        ? "Enter new cashier information below to register a new cashier"
                        : "Join the Candian's Cart family today!"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    {store ? "Store Name *" : "Full Name *"}
                  </FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder={store ? "Sabzi Mandi Supermarket" : "John Doe"}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    name="email"
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
                      pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}"
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
                  <FieldDescription>
                    Must be at least 8 characters, include uppercase, lowercase,
                    number, and special character.
                  </FieldDescription>
                </Field>
                <Field hidden={admin}>
                  <FieldLabel htmlFor="address">Address *</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    name="address"
                    placeholder={
                      customer
                        ? "308-123 Main St"
                        : "308-123 Main St, Langley, BC V6Z 3E1"
                    }
                    required={customer || store || cashier}
                  />
                </Field>
                <Field hidden={admin || store || cashier}>
                  <div className="flex justify-center items-center gap-3">
                    <div>
                      <FieldLabel htmlFor="city">City *</FieldLabel>
                      <Input
                        id="city"
                        type="text"
                        name="city"
                        placeholder="e.g., Abbotsford"
                        required={customer}
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="province">Province *</FieldLabel>
                      <Input
                        id="province"
                        type="text"
                        name="province"
                        placeholder="e.g., BC"
                        required={customer}
                      />
                    </div>
                  </div>
                </Field>
                <Field hidden={admin}>
                  <FieldLabel htmlFor="mobile">Mobile Number *</FieldLabel>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="5551234567"
                    required={customer || store || cashier}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Mobile number must be exactly 10 digits"
                  />
                </Field>
                {cashier && (
                  <>
                    <SelectStore stores={stores || []} userRole="cashier" />
                    <StoreSelected userRole="cashier" />
                  </>
                )}

                {customer && (
                  <>
                    <Input
                      id="monthlyBudget"
                      type="hidden"
                      name="monthlyBudget"
                      value={budget ?? ""}
                      required={customer}
                    />
                    <Input
                      id="referralCode"
                      type="hidden"
                      name="referralCode"
                      value={referralCode ?? ""}
                      required={customer}
                    />
                  </>
                )}

                {customer ||
                  (cashier && (
                    <Input
                      id="associatedStore"
                      type="hidden"
                      name="associatedStore"
                      value={storeId.toString() || ""}
                      required={customer || cashier}
                    />
                  ))}

                <Field>
                  <Button type="submit">
                    {isPending ? <Spinner /> : "Create Account"}
                  </Button>
                  {/* <Button variant="outline" type="button">
                    Sign up with Google
                  </Button> */}
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
