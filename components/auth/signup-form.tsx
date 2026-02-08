"use client"
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {customerSignupAction} from '@/actions/auth/customerSignup.actions'
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
const initialState = {
  success: false,
  message: ""
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [state, formAction, isPending] = useActionState(
    customerSignupAction,
    initialState
  );
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        redirect("/");
      } else {
        toast.error(state.message);
      }
    }
  }, [state.message, state.success]);

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name *</FieldLabel>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
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
              <Input id="password" type="password" name="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Adrress *</FieldLabel>
              <Input
                id="address"
                type="text"
                name="address"
                placeholder="123 Main St"
                required
              />
            </Field>
            <Field>
              <div className="flex justify-center items-center gap-3">
                <div>
                  <FieldLabel htmlFor="city">City *</FieldLabel>
                  <Input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="e.g., Abbotsford"
                    required
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="province">Province *</FieldLabel>
                  <Input
                    id="province"
                    type="text"
                    name="province"
                    placeholder="e.g., BC"
                    required
                  />
                </div>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="mobile">Mobile Number *</FieldLabel>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="5551234567"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                title="Mobile number must be exactly 10 digits"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="mobile">Do you have a car? *</FieldLabel>
              <RadioGroup
                name="hasCar"
                defaultValue="false"
                className="w-fit flex items-center"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Yes</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">No</Label>
                </div>
              </RadioGroup>
            </Field>
            <Field>
              <Button type="submit">
                {isPending ? <Spinner /> : "Create Account"}
              </Button>
              <Button variant="outline" type="button">
                Sign up with Google
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account?{" "}
                <Link href="/customer/login">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
