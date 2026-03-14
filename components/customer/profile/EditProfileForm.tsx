"use client";

import { useActionState, useEffect } from "react";
import {
  editUserProfile,
  type ProfileState,
} from "@/actions/customer/userEdit.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Check,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { Customer } from "@/types/customer/customer";
import Link from "next/link";

type FormUserData = Pick<
  Customer,
  "name" | "email" | "address" | "city" | "province" | "mobile"
>;

const initialState: ProfileState = { message: null, errors: {} };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground mb-1.5">{children}</label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
      {children}
    </p>
  );
}

function IconInput({
  icon: Icon,
  error,
  ...props
}: { icon: React.ElementType; error?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
        <Input
          {...props}
          className={`pl-10 h-11 rounded-xl border-border/60 bg-card focus-visible:ring-1 focus-visible:ring-primary ${props.className ?? ""}`}
        />
      </div>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}

export default function EditProfileForm({ user }: { user: FormUserData }) {
  const [state, formAction, isPending] = useActionState(editUserProfile, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        {/* Minimal back + title */}
        <div className="flex items-center gap-2.5 mb-4">
          <Link
            href="/customer/profile"
            className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-secondary/60 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <h1 className="text-sm font-bold tracking-tight">Edit Profile</h1>
        </div>
        <form action={formAction}>

          {/* ── DESKTOP: reference split layout ── */}
          <div className="hidden sm:grid grid-cols-[1fr_300px] gap-5 items-start">

            {/* Left — form card */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">

              {/* Account */}
              <div className="px-6 py-5">
                <SectionLabel>Account</SectionLabel>
                <FieldLabel>Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                  <Input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-secondary px-2 py-1 rounded-full">
                    locked
                  </span>
                </div>
              </div>

              {/* Personal */}
              <div className="px-6 py-5 space-y-4">
                <SectionLabel>Personal Info</SectionLabel>
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <IconInput icon={User} name="name" type="text" defaultValue={user.name} required placeholder="John Doe" error={state?.errors?.name?.[0]} />
                </div>
                <div>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <IconInput icon={Phone} name="mobile" type="tel" defaultValue={user.mobile} maxLength={10} required placeholder="6041234567" className="font-mono tracking-wider" error={state?.errors?.mobile?.[0]} />
                </div>
              </div>

              {/* Address */}
              <div className="px-6 py-5 space-y-4">
                <SectionLabel>Address</SectionLabel>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <IconInput icon={MapPin} name="address" type="text" defaultValue={user.address} required placeholder="123 Main St" error={state?.errors?.address?.[0]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <IconInput icon={Building2} name="city" type="text" defaultValue={user.city} required placeholder="Abbotsford" error={state?.errors?.city?.[0]} />
                  </div>
                  <div>
                    <FieldLabel>Province</FieldLabel>
                    <IconInput icon={Map} name="province" type="text" defaultValue={user.province} required placeholder="BC" error={state?.errors?.province?.[0]} />
                  </div>
                </div>
              </div>

              {/* Footer — Cancel + Save like reference */}
              <div className="px-6 py-4 flex items-center justify-between bg-secondary/20">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Changes save immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/customer/profile"
                    className="h-9 px-4 rounded-full border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="h-9 px-5 rounded-full bg-foreground text-background text-sm font-bold flex items-center gap-1.5 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {isPending
                      ? <><Spinner className="h-3.5 w-3.5" /> Saving…</>
                      : <><Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Save changes</>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Right — preview card */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden sticky top-20">
              <div className="px-5 pt-5 pb-3 border-b border-border/40">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Preview</p>
              </div>
              <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                {/* DiceBear avatar */}
                <Avatar className="h-20 w-20 rounded-3xl border-2 border-border/40">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(user.name)}`}
                    className="rounded-3xl"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-bold text-foreground text-base leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">{user.email}</p>
                </div>

                <div className="w-full pt-3 border-t border-border/40 space-y-2.5 text-left">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    <span>{user.mobile || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                    <span className="leading-snug">
                      {[user.address, user.city, user.province].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE: simple stacked ── */}
          <div className="sm:hidden flex flex-col gap-4">
            {/* Avatar row */}
            <div className="flex items-center gap-4 px-1">
              <Avatar className="h-14 w-14 rounded-2xl border border-border/60 shrink-0">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(user.name)}`}
                  className="rounded-2xl"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-foreground leading-none truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Account</SectionLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                  <Input type="email" defaultValue={user.email} disabled className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed" />
                </div>
              </div>

              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Personal Info</SectionLabel>
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <IconInput icon={User} name="name" type="text" defaultValue={user.name} required placeholder="John Doe" error={state?.errors?.name?.[0]} />
                </div>
                <div>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <IconInput icon={Phone} name="mobile" type="tel" defaultValue={user.mobile} maxLength={10} required placeholder="6041234567" className="font-mono tracking-wider" error={state?.errors?.mobile?.[0]} />
                </div>
              </div>

              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Address</SectionLabel>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <IconInput icon={MapPin} name="address" type="text" defaultValue={user.address} required placeholder="123 Main St" error={state?.errors?.address?.[0]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <IconInput icon={Building2} name="city" type="text" defaultValue={user.city} required placeholder="Abbotsford" error={state?.errors?.city?.[0]} />
                  </div>
                  <div>
                    <FieldLabel>Province</FieldLabel>
                    <IconInput icon={Map} name="province" type="text" defaultValue={user.province} required placeholder="BC" error={state?.errors?.province?.[0]} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isPending
                ? <><Spinner className="h-4 w-4" /> Saving…</>
                : <><Check className="h-4 w-4" strokeWidth={2.5} /> Save Changes</>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}