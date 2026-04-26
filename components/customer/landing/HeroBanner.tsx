// components/customer/landing/HeroBanner.tsx
"use client";
import { useState } from "react";
import { StoreDocument } from "@/types/store/store";
import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Zap, Users, ShoppingCart, Home, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreInfoDialog } from "@/components/customer/signup/StoreInfoDialog";

interface HeroBannerProps {
  store: StoreDocument;
}

const LEFT_IMAGES = [
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(1).png", alt: "Broccoli", cls: "absolute -left-2 top-3 w-48 h-48 xl:w-56 xl:h-56", rotation: -22, delay: "0s", duration: "6s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(2).png", alt: "Tomato", cls: "absolute left-24 top-[30%] w-32 h-32 xl:w-40 xl:h-40", rotation: 16, delay: "1s", duration: "7s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(4).png", alt: "Lemons", cls: "absolute left-20 bottom-8 w-28 h-28 xl:w-32 xl:h-32", rotation: -8, delay: "1.6s", duration: "8s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(6).png", alt: "Strawberries", cls: "absolute left-32 -top-2 w-24 h-24 xl:w-28 xl:h-28", rotation: 28, delay: "2.2s", duration: "5.5s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(5).png", alt: "Orange accent", cls: "absolute -left-4 bottom-16 w-36 h-36 xl:w-40 xl:h-40", rotation: -30, delay: "0.6s", duration: "9s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(7).png", alt: "Pineapple accent", cls: "absolute left-10 top-[55%] w-20 h-20 xl:w-24 xl:h-24", rotation: 12, delay: "3s", duration: "6.5s" },
];

const RIGHT_IMAGES = [
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(5).png", alt: "Oranges", cls: "absolute -right-2 top-6 w-48 h-48 xl:w-56 xl:h-56", rotation: 20, delay: "0.5s", duration: "6.5s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(7).png", alt: "Pineapple", cls: "absolute right-20 top-[25%] w-36 h-36 xl:w-44 xl:h-44", rotation: -18, delay: "1.2s", duration: "7.5s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(6).png", alt: "Strawberries", cls: "absolute right-4 bottom-6 w-36 h-36 xl:w-44 xl:h-44", rotation: 14, delay: "2s", duration: "8.5s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(1).png", alt: "Broccoli accent", cls: "absolute right-28 -top-3 w-24 h-24 xl:w-28 xl:h-28", rotation: -25, delay: "3.2s", duration: "10s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(2).png", alt: "Tomato accent", cls: "absolute right-32 bottom-14 w-20 h-20 xl:w-24 xl:h-24", rotation: 35, delay: "1.8s", duration: "7s" },
  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(4).png", alt: "Lemon accent", cls: "absolute -right-4 bottom-28 w-28 h-28 xl:w-32 xl:h-32", rotation: -12, delay: "0.9s", duration: "8s" },
];

const MOBILE_BG_IMAGES = {
  left:  { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(6).png", rotation: 12, delay: "0.8s", duration: "7s" },
  right: { src: "https://ik.imagekit.io/zaia2gfsw/pngwing.com%20(5).png", rotation: 15, delay: "0.5s", duration: "6.5s" },
};

const LEFT_CARD         = { icon: Leaf,        iconBg: "bg-green-500",   iconColor: "text-white",   eyebrow: "Certified",     title: "Farm Fresh" };
const RIGHT_CARD_TOP    = { stat: "500+",       label: "Families in Abbotsford", badge: "Growing",  badgeColor: "text-green-600 bg-green-500/10" };
const RIGHT_CARD_BOTTOM = { icon: ShoppingCart, iconBg: "bg-primary/15", iconColor: "text-primary", title: "Family exclusive", subtitle: "Invite-only platform" };

export function HeroBanner({ store }: HeroBannerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const RightCardBottomIcon = RIGHT_CARD_BOTTOM.icon;
  const LeftCardIcon = LEFT_CARD.icon;

  return (
    <section className="relative bg-[#f7faf7] overflow-hidden min-h-[520px] lg:min-h-[580px] flex items-center">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #c8e6c9 1.5px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-green-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-green-100/60 blur-3xl pointer-events-none" />

      {/* ── MOBILE BG IMAGES ── */}
      <div className="lg:hidden absolute inset-0 pointer-events-none">
        <div className="absolute -left-6 -bottom-4 w-48 h-48 opacity-80 drop-shadow-xl" style={{ rotate: `${MOBILE_BG_IMAGES.left.rotation}deg`, animation: `floatAnim ${MOBILE_BG_IMAGES.left.duration} ease-in-out ${MOBILE_BG_IMAGES.left.delay} infinite` }}>
          <Image src={MOBILE_BG_IMAGES.left.src} alt="" fill className="object-contain" sizes=""/>
        </div>
        <div className="absolute -right-6 -top-4 w-48 h-48 opacity-80 drop-shadow-xl" style={{ rotate: `${MOBILE_BG_IMAGES.right.rotation}deg`, animation: `floatAnim ${MOBILE_BG_IMAGES.right.duration} ease-in-out ${MOBILE_BG_IMAGES.right.delay} infinite` }}>
          <Image src={MOBILE_BG_IMAGES.right.src} alt="" fill className="object-contain" sizes=""/>
        </div>
      </div>

      {/* ── DESKTOP LEFT ── */}
      <div className="absolute left-0 top-0 w-[300px] xl:w-[340px] h-full pointer-events-none hidden lg:block">
        {LEFT_IMAGES.map((img) => (
          <div key={img.alt} className={`${img.cls} drop-shadow-2xl`} style={{ rotate: `${img.rotation}deg`, animation: `floatAnim ${img.duration} ease-in-out ${img.delay} infinite` }}>
            <Image src={img.src} alt={img.alt} fill className="object-contain" sizes=""/>
          </div>
        ))}
        <div className="absolute left-36 top-[62%] bg-white rounded-2xl shadow-xl border border-green-100 px-4 py-3 flex items-center gap-2.5 z-10" style={{ animation: "floatAnim 5s ease-in-out 0.4s infinite" }}>
          <div className={`w-8 h-8 rounded-xl ${LEFT_CARD.iconBg} flex items-center justify-center shrink-0`}>
            <LeftCardIcon className={`h-4 w-4 ${LEFT_CARD.iconColor}`} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium leading-none">{LEFT_CARD.eyebrow}</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{LEFT_CARD.title}</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP RIGHT ── */}
      <div className="absolute right-0 top-0 w-[300px] xl:w-[340px] h-full pointer-events-none hidden lg:block">
        {RIGHT_IMAGES.map((img) => (
          <div key={img.alt} className={`${img.cls} drop-shadow-2xl`} style={{ rotate: `${img.rotation}deg`, animation: `floatAnim ${img.duration} ease-in-out ${img.delay} infinite` }}>
            <Image src={img.src} alt={img.alt} fill className="object-contain" sizes="" />
          </div>
        ))}
        <div className="absolute right-36 top-[12%] bg-white rounded-2xl shadow-xl border border-border/60 px-4 py-3 min-w-[140px] z-10" style={{ animation: "floatAnim 5.5s ease-in-out 1s infinite" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xl font-black text-foreground tabular-nums">{RIGHT_CARD_TOP.stat}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${RIGHT_CARD_TOP.badgeColor}`}>{RIGHT_CARD_TOP.badge}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">{RIGHT_CARD_TOP.label}</p>
        </div>
        <div className="absolute right-10 bottom-24 bg-white rounded-2xl shadow-xl border border-green-100 px-4 py-3 flex items-center gap-2.5 z-10" style={{ animation: "floatAnim 6s ease-in-out 1.8s infinite" }}>
          <div className={`w-8 h-8 rounded-xl ${RIGHT_CARD_BOTTOM.iconBg} flex items-center justify-center shrink-0`}>
            <RightCardBottomIcon className={`h-4 w-4 ${RIGHT_CARD_BOTTOM.iconColor}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{RIGHT_CARD_BOTTOM.title}</p>
            <p className="text-[10px] text-muted-foreground">{RIGHT_CARD_BOTTOM.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── CENTER CONTENT ── */}
      <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center flex flex-col items-center gap-5">

        {/* ── HOME STORE BADGE — opens StoreInfoDialog directly ── */}
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 bg-white border border-green-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm shadow-green-900/5 hover:border-green-300 hover:shadow-green-900/10 transition-all group cursor-pointer"
          style={{ animation: "floatAnim 5s ease-in-out 0.3s infinite" }}
        >
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0">
            <Home className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-left leading-tight">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Your home store</p>
            <p className="text-xs font-bold text-foreground mt-0.5 leading-none group-hover:text-green-600 transition-colors underline underline-offset-2 decoration-green-300">
              {store.name}
            </p>
          </div>
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <div className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Verified
          </div>
          <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-300", dialogOpen && "rotate-180")} />
        </button>

        {/* Pill */}
        <div className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-1.5 rounded-full">
          <Leaf className="h-3.5 w-3.5" />
          Fresh · Local · Family Exclusive
        </div>

        <div className="space-y-1">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground leading-[1.02] tracking-tighter">
            Fresh groceries,
          </h1>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-green-600 leading-[1.02] tracking-tighter">
            real rewards.
          </h1>
        </div>

        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-sm">
          Farm-fresh produce and pantry essentials exclusively for Canadian families.
        </p>

        {/* Search */}
        <Link
          href="/customer/search"
          className="w-full max-w-md flex items-center gap-3 bg-white rounded-2xl px-5 h-14 shadow-xl shadow-green-900/10 border border-green-100 hover:shadow-green-900/15 hover:border-green-200 transition-all group"
        >
          <svg className="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-slate-400 text-sm group-hover:text-slate-500 transition-colors flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
            Search bananas, milk, bread…
          </span>
          <span className="text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-xl shrink-0 group-hover:bg-green-700 transition-colors">
            Search
          </span>
        </Link>

        {/* Trust chips */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { icon: <Zap className="h-3.5 w-3.5" />,        label: "Great value" },
            { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Quality guaranteed" },
            { icon: <Users className="h-3.5 w-3.5" />,       label: "Family-only access" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white text-xs bg-primary px-3.5 py-1.5 rounded-full border border-green-600/15">
              {icon}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* StoreInfoDialog — rendered at section level, outside center content */}
      <StoreInfoDialog
        store={store}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <style>{`
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}