"use client";

import { useActionState, useEffect } from "react";
import {
  editUserProfile,
  type ProfileState,
} from "@/actions/customer/userEdit.action";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Building2,
  Map,
  CheckCircle,
} from "lucide-react";
import { Customer } from "@/types/customer/customer";

type FormUserData = Pick<
  Customer,
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
    <div className="w-full max-w-xl mx-auto p-4">
      {/* Header */}
      
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
          <User className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Update your personal information below.
        </p>
      </div>

      <form action={formAction}>
        <FieldGroup className="space-y-4">
          {/* Email — disabled */}
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Email
            </FieldLabel>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 z-10" />
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="pl-10 h-11 bg-muted/40 cursor-not-allowed text-muted-foreground border-border/40"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">
                locked
              </span>
            </div>
          </Field>

          {/* Full Name */}
          <Field>
            <FieldLabel
              htmlFor="name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Full Name <span className="text-primary">*</span>
            </FieldLabel>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
                placeholder="John Doe"
                className="pl-10 h-11 focus:border-primary transition-all"
              />
            </div>
            {state?.errors?.name && (
              <p className="text-xs text-destructive mt-1">
                {state.errors.name[0]}
              </p>
            )}
          </Field>

          {/* Address */}
          <Field>
            <FieldLabel
              htmlFor="address"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Address <span className="text-primary">*</span>
            </FieldLabel>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                id="address"
                name="address"
                type="text"
                defaultValue={user.address}
                required
                placeholder="123 Main St"
                className="pl-10 h-11 focus:border-primary transition-all"
              />
            </div>
            {state?.errors?.address && (
              <p className="text-xs text-destructive mt-1">
                {state.errors.address[0]}
              </p>
            )}
          </Field>

          {/* City + Province */}
          <Field>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="city"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  City <span className="text-primary">*</span>
                </FieldLabel>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    defaultValue={user.city}
                    required
                    placeholder="Abbotsford"
                    className="pl-10 h-11 focus:border-primary transition-all"
                  />
                </div>
                {state?.errors?.city && (
                  <p className="text-xs text-destructive">
                    {state.errors.city[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="province"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Province <span className="text-primary">*</span>
                </FieldLabel>
                <div className="relative group">
                  <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    id="province"
                    name="province"
                    type="text"
                    defaultValue={user.province}
                    required
                    placeholder="BC"
                    className="pl-10 h-11 focus:border-primary transition-all"
                  />
                </div>
                {state?.errors?.province && (
                  <p className="text-xs text-destructive">
                    {state.errors.province[0]}
                  </p>
                )}
              </div>
            </div>
          </Field>

          {/* Mobile */}
          <Field>
            <FieldLabel
              htmlFor="mobile"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Mobile Number <span className="text-primary">*</span>
            </FieldLabel>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                defaultValue={user.mobile}
                maxLength={10}
                required
                placeholder="6041234567"
                className="pl-10 h-11 font-mono tracking-wider focus:border-primary transition-all"
              />
            </div>
            {state?.errors?.mobile && (
              <p className="text-xs text-destructive mt-1">
                {state.errors.mobile[0]}
              </p>
            )}
          </Field>

          {/* Submit */}
          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" /> Saving Changes…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Save Profile
                </span>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
