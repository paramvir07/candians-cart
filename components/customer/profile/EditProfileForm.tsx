"use client";

import { useActionState, useEffect } from "react";
import {
  editUserProfile,
  type ProfileState,
} from "@/actions/customer/userEdit.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICustomer } from "@/db/models/customer/customer.model";
import { toast } from "sonner";

type FormUserData = Pick<
  ICustomer,
  "name" | "email" | "address" | "city" | "province" | "mobile"
>;

const initialState: ProfileState = { message: null, errors: {} };

export default function EditProfileForm({ user }: { user: FormUserData }) {
  const [state, formAction, isPending] = useActionState(
    editUserProfile,
    initialState,
  );
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Card className="m-2">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email (Cannot be changed)</FieldLabel>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Full Name *</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address *</FieldLabel>
              <Input
                id="address"
                name="address"
                type="text"
                defaultValue={user.address}
                required
              />
            </Field>

            <Field>
              <div className="flex gap-3">
                <div className="flex-1">
                  <FieldLabel htmlFor="city">City *</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    defaultValue={user.city}
                    required
                  />
                  {state?.errors?.city && (
                    <p className="text-sm text-red-500">
                      {state.errors.city[0]}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <FieldLabel htmlFor="province">Province *</FieldLabel>
                  <Input
                    id="province"
                    name="province"
                    type="text"
                    defaultValue={user.province}
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
                defaultValue={user.mobile}
                maxLength={10}
                required
              />
            </Field>

            <Field className="mt-6">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Saving Changes..." : "Save Profile"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
