import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Customer } from "@/types/customer/customer";
import { Edit, QrCode, MapPin, CalendarDays, X } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getMemberSince } from "@/lib/memberSince";
import ShareButton from "@/components/shared/share/ShareButton";
import { IReferralCode } from "@/db/models/admin/referralCode.model";
import logoIcon from "@/app/icon.jpg";
import { QRCodeSVG } from "qrcode.react";
import EmailVerificationBadge from "./EmailVerificationBadge";

type Props = {
  customer: Pick<
    Customer,
    | "_id"
    | "name"
    | "email"
    | "emailVerified"
    | "aptUnit"
    | "address"
    | "city"
    | "province"
    | "postalCode"
    | "createdAt"
  >;
  referralCode: IReferralCode | null;
};

export default function ProfileHero({ customer, referralCode }: Props) {
  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const streetAddress = customer.address?.trim();
  const aptUnit = customer.aptUnit?.trim();

  const streetAddressWithUnit =
    aptUnit && streetAddress
      ? `${aptUnit}-${streetAddress}`
      : streetAddress || "";

  const formattedAddress = [
    streetAddressWithUnit,
    customer.city,
    customer.province,
    customer.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Banner */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.6271 0.1699 149.2138) 0%, oklch(0.4104 0.1066 149.9393) 100%)",
        }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/8" />
        <div className="absolute top-4 right-20 w-10 h-10 rounded-full bg-white/10" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-white/90 tabular-nums tracking-wide">
            #{customer._id.toString().slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 pb-5">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <div className="rounded-full ring-4 ring-card p-0.5 bg-card">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(customer.name)}`}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold rounded-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-card" />
          </div>

          {/* <div className="mb-1 flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Verified Member
          </div> */}
        </div>

        {/* Name + meta */}
        <div className="mb-5 space-y-1.5">
          <h1 className="text-xl font-black text-foreground tracking-tight leading-none">
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground">{customer.email}</p>

          <div className="mt-1.5">
            <EmailVerificationBadge
              email={customer.email}
              verified={customer.emailVerified ?? false}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">
                {formattedAddress || "Address not set"}
              </span>
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 text-primary shrink-0" />
              Joined {getMemberSince(customer.createdAt)}
            </span>
          </div>
        </div>

        {/* CTAs — FIX: removed <Link> inside <Button>, use asChild instead */}
        <div className="flex gap-1 min-w-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-full text-sm font-semibold border-border hover:border-primary/50 hover:text-primary transition-all"
              >
                <QrCode className="h-4 w-4 mr-2" />
                My QR Code
              </Button>
            </DialogTrigger>

            <DialogOverlay className="bg-black/50 backdrop-blur-sm" />

            <DialogContent className="sm:max-w-[360px] overflow-hidden rounded-3xl border border-primary/20 bg-background p-0 shadow-2xl">
              <div className="relative bg-gradient-to-br from-primary/15 via-background to-muted px-6 py-6 text-center">
                <DialogClose asChild>
                  <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>

                <DialogHeader className="space-y-2 text-center">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    Customer QR Code
                  </DialogTitle>

                  <DialogDescription className="text-sm text-muted-foreground">
                    Scan to quickly access this customer profile.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-5">
                <div className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <Avatar className="h-10 w-10 shrink-0 rounded-full ring-1 ring-border">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(
                        customer.name,
                      )}&backgroundColor=b6e3f4,c0aede`}
                      className="rounded-full"
                    />

                    <AvatarFallback className="rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight text-foreground">
                      {customer.name}
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold tabular-nums text-primary">
                      #{customer._id.toString().slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-primary/20 bg-card p-3 shadow-sm">
                  <div className="rounded-2xl bg-white p-3">
                    <QRCodeSVG
                      value={customer._id.toString()}
                      size={220}
                      fgColor="#000000"
                      bgColor="#ffffff"
                      level="H"
                      marginSize={0}
                      imageSettings={{
                        src: logoIcon.src,
                        height: 44,
                        width: 44,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* FIX: Button asChild with Link inside — no nested interactive elements */}
          <Link
            href="/customer/profile/edit"
            className={buttonVariants({
              className:
                "flex-1 h-10 rounded-full! text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all",
            })}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>

          <div className="shrink-0">
            <ShareButton code={referralCode?.code} />
          </div>
        </div>
      </div>
    </div>
  );
}
