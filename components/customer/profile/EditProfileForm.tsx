"use client";

import { useActionState, useState } from "react";
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
import { ICustomerInfo } from "@/db/models/customer/customerInfo.model";

type FormUserData = Pick<
  ICustomerInfo,
  | "name"
  | "email"
  | "address"
  | "city"
  | "province"
  | "mobile"
  | "hasCar"
  | "carModel"
  | "carYear"
>;

const initialState: ProfileState = { message: null, errors: {} };

export default function EditProfileForm({ user }: { user: FormUserData }) {
  const [state, formAction, isPending] = useActionState(
    editUserProfile,
    initialState,
  );

  // Track checkbox state so we can show/hide car inputs dynamically
  const [hasCar, setHasCar] = useState(user.hasCar);

  // If the database says they already have a car, we lock these fields forever
  const isCarLocked = user.hasCar === true;

  return (
    <Card className="m-2">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {/* Server Action Messages */}
            {state?.message && (
              <div
                className={`p-3 text-sm rounded-md ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {state.message}
              </div>
            )}

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
              {state?.errors?.name && (
                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
              )}
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
              {state?.errors?.address && (
                <p className="text-sm text-red-500">
                  {state.errors.address[0]}
                </p>
              )}
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
                  {state?.errors?.province && (
                    <p className="text-sm text-red-500">
                      {state.errors.province[0]}
                    </p>
                  )}
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
              {state?.errors?.mobile && (
                <p className="text-sm text-red-500">{state.errors.mobile[0]}</p>
              )}
            </Field>

            <hr className="my-4 border-gray-200" />

            {/* --- THE CAR ENFORCER UI --- */}
            <Field>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasCar"
                  name="hasCar"
                  checked={hasCar}
                  onChange={(e) => setHasCar(e.target.checked)}
                  disabled={isCarLocked} // Lock checkbox if DB says true
                  className="w-4 h-4"
                />
                <FieldLabel htmlFor="hasCar" className="mb-0">
                  I own a car
                </FieldLabel>
              </div>
              {isCarLocked && (
                <p className="text-xs text-gray-500">
                  Car details are locked once registered.
                </p>
              )}
            </Field>

            {hasCar && (
              <div className="flex gap-3 p-4 bg-gray-50 rounded-md border">
                <div className="flex-1">
                  <FieldLabel htmlFor="carModel">Car Model</FieldLabel>
                  <Input
                    id="carModel"
                    name="carModel"
                    type="text"
                    defaultValue={user.carModel}
                    disabled={isCarLocked} // Lock input if DB says true
                  />
                  {state?.errors?.carModel && (
                    <p className="text-sm text-red-500">
                      {state.errors.carModel[0]}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <FieldLabel htmlFor="carYear">Car Year</FieldLabel>
                  <Input
                    id="carYear"
                    name="carYear"
                    type="number"
                    defaultValue={user.carYear}
                    disabled={isCarLocked} // Lock input if DB says true
                  />
                  {state?.errors?.carYear && (
                    <p className="text-sm text-red-500">
                      {state.errors.carYear[0]}
                    </p>
                  )}
                </div>
              </div>
            )}

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
