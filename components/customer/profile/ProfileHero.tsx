import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer/customer";
import {
  Edit,
  QrCode,
  ShieldCheck,
  MapPin,
  CalendarDays,
  X,
  KeyRound,
} from "lucide-react";
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
import QrCodeClient from "./QrCodeClient";
import { getMemberSince } from "@/lib/memberSince";
import ShareButton from "@/components/shared/share/ShareButton";

type Props = {
  customer: Pick<
    Customer,
    "_id" | "name" | "email" | "address" | "city" | "province" | "createdAt"
  >;
};

export default function ProfileHero({ customer }: Props) {
  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* ── Banner ── */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.6271 0.1699 149.2138) 0%, oklch(0.4104 0.1066 149.9393) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/8" />
        <div className="absolute top-4 right-20 w-10 h-10 rounded-full bg-white/10" />

        {/* Customer ID chip — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-white/90 tabular-nums tracking-wide">
            #{customer._id.toString().slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Avatar + verified — overlapping the banner ── */}
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
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-card" />
          </div>

          {/* Verified badge */}
          <div className="mb-1 flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Verified Member
          </div>
        </div>

        {/* ── Name + meta ── */}
        <div className="mb-5 space-y-1.5">
          <h1 className="text-xl font-black text-foreground tracking-tight leading-none">
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground">{customer.email}</p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              {customer.city}, {customer.province}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 text-primary shrink-0" />
              Joined {getMemberSince(customer.createdAt)}
            </span>
          </div>
        </div>

        {/* ── CTAs ── */}
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
            <DialogContent className="sm:max-w-[320px] rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-card">
              <div
                className="relative px-6 pt-6 pb-4 border-b border-border/60"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.9669 0.0287 158.0617) 0%, oklch(1 0 0) 100%)",
                }}
              >
                <DialogClose asChild>
                  <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
                <DialogHeader className="text-center">
                  <DialogTitle className="text-base font-bold">
                    Customer QR Code
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    Scan to quickly access your profile.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3.5 py-3">
                  <Avatar className="h-9 w-9 ring-1 ring-border rounded-full shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(customer.name)}&backgroundColor=b6e3f4,c0aede`}
                      className="rounded-full"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate leading-tight">
                      {customer.name}
                    </p>
                    <p className="text-[10px] text-primary font-bold mt-0.5 tabular-nums">
                      #{customer._id.toString().slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-border/40">
                    <QrCodeClient id={customer._id.toString()} />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="flex-1 h-10 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
            <Link href="/customer/profile/edit" className="flex">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>

          {/* <Button
            size="icon"
            variant="outline"
            className="rounded-xl border-green-500 text-green-600 hover:bg-green-50"
          >
            <Link href="/customer/change-password" className="flex">
              <KeyRound className="h-4 w-4" />
            </Link>
          </Button> */}
          <div className="shrink-0">
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  );
}
