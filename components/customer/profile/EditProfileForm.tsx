"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
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
import { useRouter } from "next/navigation";

type FormUserData = Pick<
  Customer,
  "name" | "email" | "address" | "city" | "province" | "mobile"
>;

type EditableFields = Omit<FormUserData, "email">;

const initialState: ProfileState = { message: null, errors: {} };

const BC_CITIES = [
  "Vancouver",
  "Burnaby",
  "New Westminster",
  "Coquitlam",
  "Port Coquitlam",
  "Port Moody",
  "Surrey",
  "Delta",
  "Langley",
  "Maple Ridge",
  "Pitt Meadows",
  "Abbotsford",
  "Mission",
  "Chilliwack",
  "Agassiz",
  "Hope",
] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground mb-1.5">
      {children}
    </label>
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
}: { icon: React.ElementType; error?: string } & React.ComponentProps<
  typeof Input
>) {
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

function IconSelect({
  icon: Icon,
  error,
  children,
  ...props
}: {
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
} & React.ComponentProps<"select">) {
  return (
    <div>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
        <select
          {...props}
          className={`w-full pl-10 pr-3 h-11 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary ${props.className ?? ""}`}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}

export default function EditProfileForm({ user }: { user: FormUserData }) {
  const [state, formAction, isPending] = useActionState(
    editUserProfile,
    initialState,
  );

  const router = useRouter()

  // Trim all incoming backend values once
  const trimmed: FormUserData = {
    name: user.name.trim(),
    email: user.email.trim(),
    address: user.address.trim(),
    city: user.city.trim(),
    province: user.province.trim(),
    mobile: user.mobile.trim(),
  };

  // Controlled state for editable fields (trimmed originals as baseline)
  const [fields, setFields] = useState<EditableFields>({
    name: trimmed.name,
    address: trimmed.address,
    city: trimmed.city,
    province: trimmed.province || "BC",
    mobile: trimmed.mobile,
  });

  // Unified handler for both input and select elements
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFields((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  // Check whether anything actually changed (compare trimmed current vs trimmed original)
  const hasChanges =
    fields.name.trim() !== trimmed.name ||
    fields.address.trim() !== trimmed.address ||
    fields.city.trim() !== trimmed.city ||
    fields.province.trim() !== trimmed.province ||
    fields.mobile.trim() !== trimmed.mobile;

  useEffect(() => {
    if (state.message) {
      if (state.success){
        toast.success(state.message);
        router.push("/customer/profile")
      } 
      else toast.error(state.message);
    }
  }, [state]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (!hasChanges) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      // Override each editable field with its trimmed value
      (Object.keys(fields) as (keyof EditableFields)[]).forEach((key) => {
        fd.set(key, (fields[key] ?? "").trim());
      });
      formAction(fd);
    },
    [fields, hasChanges, formAction],
  );

  const initials = trimmed.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Live preview uses trimmed-on-type values
  const previewName = fields.name.trim() || trimmed.name;
  const previewMobile = fields.mobile.trim() || "—";
  const previewAddress =
    [fields.address.trim(), fields.city.trim(), fields.province.trim()]
      .filter(Boolean)
      .join(", ") || "—";

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

        <form onSubmit={handleSubmit}>
          {/* ── DESKTOP: two-column split layout ── */}
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
                    defaultValue={trimmed.email}
                    disabled
                    className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
                  />
                  <Link className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-white bg-primary px-2 py-1 rounded-full" href={"/customer/change-email"}>Change email</Link>  
                </div>
              </div>
              

              {/* Personal */}
              <div className="px-6 py-5 space-y-4">
                <SectionLabel>Personal Info</SectionLabel>
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <IconInput
                    icon={User}
                    name="name"
                    type="text"
                    value={fields.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    error={state?.errors?.name?.[0]}
                  />
                </div>
                <div>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <IconInput
                    icon={Phone}
                    name="mobile"
                    type="tel"
                    value={fields.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    required
                    placeholder="6041234567"
                    className="font-mono tracking-wider"
                    error={state?.errors?.mobile?.[0]}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="px-6 py-5 space-y-4">
                <SectionLabel>Address</SectionLabel>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <IconInput
                    icon={MapPin}
                    name="address"
                    type="text"
                    value={fields.address}
                    onChange={handleChange}
                    required
                    placeholder="123 Main St"
                    error={state?.errors?.address?.[0]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <IconSelect
                      icon={Building2}
                      name="city"
                      value={fields.city}
                      onChange={handleChange}
                      required
                      error={state?.errors?.city?.[0]}
                    >
                      <option value="" disabled>
                        Select City
                      </option>
                      {BC_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </IconSelect>
                  </div>
                  <div>
                    <FieldLabel>Province</FieldLabel>
                    <IconSelect
                      icon={Map}
                      name="province"
                      value={fields.province}
                      onChange={handleChange}
                      required
                      error={state?.errors?.province?.[0]}
                    >
                      <option value="BC">British Columbia (BC)</option>
                    </IconSelect>
                  </div>
                </div>
              </div>

              {/* Footer — Cancel + Save */}
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
                    disabled={isPending || !hasChanges}
                    className="h-9 px-5 rounded-full bg-primary text-background text-sm font-bold flex items-center gap-1.5 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Spinner className="h-4 w-4" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2.5} /> Save
                        changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right — preview card */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden sticky top-20">
              <div className="px-5 pt-5 pb-3 border-b border-border/40">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Preview
                </p>
              </div>
              <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                <Avatar className="h-20 w-20 rounded-3xl border-2 border-border/40">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(previewName)}`}
                    className="rounded-3xl"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-bold text-foreground text-base leading-none">
                    {previewName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {trimmed.email}
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-border/40 space-y-2.5 text-left">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    <span>{previewMobile}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                    <span className="leading-snug">{previewAddress}</span>
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
                  src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(previewName)}`}
                  className="rounded-2xl"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-foreground leading-none truncate">
                  {previewName}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {trimmed.email}
                </p>
                
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              {/* Account */}
              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Account</SectionLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                  <Input
                    type="email"
                    defaultValue={trimmed.email}
                    disabled
                    className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
                  />
                  <Link className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-white bg-primary px-2 py-1 rounded-full" href={"/customer/change-email"}>Change email</Link>
                </div>
              </div>

              {/* Personal */}
              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Personal Info</SectionLabel>
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <IconInput
                    icon={User}
                    name="name"
                    type="text"
                    value={fields.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    error={state?.errors?.name?.[0]}
                  />
                </div>
                <div>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <IconInput
                    icon={Phone}
                    name="mobile"
                    type="tel"
                    value={fields.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    required
                    placeholder="6041234567"
                    className="font-mono tracking-wider"
                    error={state?.errors?.mobile?.[0]}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="px-5 py-5 space-y-4">
                <SectionLabel>Address</SectionLabel>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <IconInput
                    icon={MapPin}
                    name="address"
                    type="text"
                    value={fields.address}
                    onChange={handleChange}
                    required
                    placeholder="123 Main St"
                    error={state?.errors?.address?.[0]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <IconSelect
                      icon={Building2}
                      name="city"
                      value={fields.city}
                      onChange={handleChange}
                      required
                      error={state?.errors?.city?.[0]}
                    >
                      <option value="" disabled>
                        Select City
                      </option>
                      {BC_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </IconSelect>
                  </div>
                  <div>
                    <FieldLabel>Province</FieldLabel>
                    <IconSelect
                      icon={Map}
                      name="province"
                      value={fields.province}
                      onChange={handleChange}
                      required
                      error={state?.errors?.province?.[0]}
                    >
                      <option value="BC">British Columbia (BC)</option>

                    </IconSelect>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !hasChanges}
              className="w-full h-12 rounded-full bg-primary text-background text-sm font-bold flex items-center justify-center gap-2 hover:opacity-85 disabled:scale-100 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Spinner className="h-4 w-4" /> Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}