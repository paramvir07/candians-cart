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
    <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-linear-to-br from-primary/15 via-primary/5 to-transparent">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-primary/8 blur-2xl pointer-events-none" />

      <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6">
        {/* Avatar — centered on desktop for a "profile card" feel */}
        <div className="flex flex-col items-center text-center lg:flex-col lg:items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl scale-125" />
            <Avatar className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-2xl">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customer.name)}`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl lg:text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-background shadow" />
          </div>

          <div className="min-w-0 w-full">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold tracking-tight">
                {customer.name}
              </h1>
              {/* Verified badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary/90 font-bold mt-1">
              #{customer._id.toString().slice(-6).toUpperCase()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {customer.email}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-1.5">
              📍 {customer.address}, {customer.city}, {customer.province}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2.5 mt-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold border-border/60 hover:border-primary/50 hover:text-primary transition-all"
              >
                <QrCode className="h-3.5 w-3.5 mr-1.5" />
                QR Code
              </Button>
            </DialogTrigger>

            <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-md rounded-3xl border-border/60 p-0 overflow-hidden">
              {/* Top gradient header */}
              <div className="relative bg-linear-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b">
                <DialogClose asChild>
                  <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/80 transition">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>

                <DialogHeader className="text-center space-y-2">
                  <DialogTitle className="text-primary text-xl font-bold tracking-tight">
                    Customer QR Code
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Scan this code to quickly access the customer profile and
                    details.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Main content */}
              <div className="px-6 py-6">
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                  {/* Customer info section */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b bg-muted/30">
                    <Avatar className="h-12 w-12 ring-1 ring-border">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customer.name)}`}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {customer.name}
                      </p>
                      {/* <p className="text-xs text-muted-foreground truncate">
                        {customer.email}
                      </p> */}
                      <p className="text-[11px] text-primary font-medium mt-1">
                        Customer ID: #
                        {customer._id.toString().slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* QR section */}
                  <div className="flex flex-col items-center justify-center px-4 py-6 bg-background">
                    <div className="relative">
                      {/* subtle glow */}
                      <div className="absolute inset-0 scale-110 rounded-2xl bg-primary/10 blur-2xl" />

                      <div className="relative rounded-2xl bg-white p-4 sm:p-5 shadow-lg border">
                        <QrCodeClient id={customer._id.toString()} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            asChild
            className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
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
