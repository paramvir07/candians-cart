import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer/customer";
import { Edit, QrCode, ShieldCheck, X } from "lucide-react";
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

type Props = {
  customer: Pick<
    Customer,
    "_id" | "name" | "email" | "address" | "city" | "province"
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
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">

      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-br from-primary/20 via-primary/8 to-transparent overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* Customer ID chip */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/75 backdrop-blur-sm border border-border/60 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[10px] font-semibold text-foreground tabular-nums tracking-wide">
            #{customer._id.toString().slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-9 mb-4">
          <div className="relative">
            <Avatar className="h-[72px] w-[72px] ring-4 ring-card shadow-lg rounded-2xl">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customer.name)}`}
                className="rounded-2xl"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-card" />
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full mb-0.5">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        {/* Name + meta */}
        <div className="mb-5">
          <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight">
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{customer.email}</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            📍 {customer.address}, {customer.city}, {customer.province}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-full text-xs font-semibold border-border/70 hover:border-primary/50 hover:text-primary transition-all"
              >
                <QrCode className="h-3.5 w-3.5 mr-1.5" />
                My QR Code
              </Button>
            </DialogTrigger>

            <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-[320px] rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-card">
              {/* Dialog header */}
              <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border/60">
                <DialogClose asChild>
                  <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
                <DialogHeader className="text-center">
                  <DialogTitle className="text-base font-bold">Customer QR Code</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    Scan to quickly access your profile.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Identity row */}
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3">
                  <Avatar className="h-9 w-9 ring-1 ring-border rounded-xl shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customer.name)}`}
                      className="rounded-xl"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate leading-tight">{customer.name}</p>
                    <p className="text-[10px] text-primary font-semibold mt-0.5 tabular-nums">
                      #{customer._id.toString().slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* QR */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 scale-110 rounded-2xl bg-primary/8 blur-xl" />
                    <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-border/40">
                      <QrCodeClient id={customer._id.toString()} />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            asChild
            size="sm"
            className="flex-1 h-9 rounded-full text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Link href="/customer/profile/edit">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}