"use client";

import { useState } from "react";
import { Share2, QrCode, X, ChevronLeft, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { getReferralShareMessage, getReferralUrl } from "@/lib/shareMessage";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_URL = "https://www.canadianscart.ca";

function getDefaultShareMessage(url: string): string {
  return `🛒 FREE Milk, Atta & Ghee just for shopping groceries?! YES!
Canadian's Cart (CC) is NOW launching at Sunfarm Produce, Abbotsford BC! 🎉

🎁 Win a $500 Grocery Gift Card — One lucky member will take it home!

📲 Sign Up TODAY with referral code: WELCOMETOCC

📍 3670 Town Line Rd #108, Abbotsford, BC

${url}`;
}

// ─── Share app configs ────────────────────────────────────────────────────────

interface AppConfig {
  label: string;
  bg: string;
  icon: React.ReactNode;
  href: (url: string, message: string) => string;
}

const APPS: AppConfig[] = [
  {
    label: "WhatsApp",
    bg: "#25D366",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.877L.057 23.887l6.197-1.455A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.937 0-3.748-.5-5.325-1.373l-.38-.224-3.938.924.966-3.834-.245-.396A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    ),
    href: (_url, message) =>
      `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  {
    label: "X",
    bg: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: (_url, message) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
  },
  {
    label: "Mail",
    bg: "#007AFF",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    href: (_url, message) =>
      `mailto:?subject=${encodeURIComponent(
        "Canadian's Cart Grocery Giveaway"
      )}&body=${encodeURIComponent(message)}`,
  },
  {
    label: "Messages",
    bg: "#34C759",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    href: (_url, message) => `sms:?body=${encodeURIComponent(message)}`,
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalView = "picker" | "qr" | "share";

interface ShareButtonProps {
  link?: string;
  code?: string;
}

// ─── URL copy strip ───────────────────────────────────────────────────────────

function UrlCopyStrip({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
      <span className="flex-1 truncate font-mono text-xs text-muted-foreground w-0">
        {url}
      </span>
      <Button
        size="sm"
        variant={copied ? "outline" : "default"}
        className={
          copied
            ? "rounded-lg border-green-400 text-xs text-green-700 hover:bg-transparent"
            : "rounded-lg bg-green-600 text-xs text-white hover:bg-green-700"
        }
        onClick={copyUrl}
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <Check size={11} /> Copied
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Copy size={11} /> Copy
          </span>
        )}
      </Button>
    </div>
  );
}

// ─── Picker view ──────────────────────────────────────────────────────────────

function PickerView({
  onQr,
  onShare,
}: {
  onQr: () => void;
  onShare: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
      <button
        onClick={onQr}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5 transition-all hover:bg-muted/70 active:scale-95"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <QrCode className="h-7 w-7" />
        </span>
        <span className="text-sm font-medium text-foreground">QR Code</span>
        <span className="text-center text-xs leading-relaxed text-muted-foreground">
          Scan to open on another device
        </span>
      </button>

      <button
        onClick={onShare}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5 transition-all hover:bg-muted/70 active:scale-95"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <Share2 className="h-7 w-7" />
        </span>
        <span className="text-sm font-medium text-foreground">Share Link</span>
        <span className="text-center text-xs leading-relaxed text-muted-foreground">
          Send via apps or copy message
        </span>
      </button>
    </div>
  );
}

// ─── QR view ─────────────────────────────────────────────────────────────────

function QrView({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-5 pt-2 pb-2">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-inner">
        <QRCodeSVG value={url} size={200} />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">
          Scan with your camera
        </p>
        <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          Point your phone camera at the code to open the link instantly
        </p>
      </div>
      <div className="w-full">
        <UrlCopyStrip url={url} />
      </div>
    </div>
  );
}

// ─── Share sheet view ─────────────────────────────────────────────────────────

function ShareSheetView({
  url,
  shareMessage,
}: {
  url: string;
  shareMessage: string;
}) {
  return (
    <div className="flex flex-col gap-5 pt-2 pb-2">
      <div className="flex justify-around">
        {APPS.map((app) => (
          <a
            key={app.label}
            href={app.href(url, shareMessage)}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 active:scale-95"
              style={{ background: app.bg }}
            >
              {app.icon}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {app.label}
            </span>
          </a>
        ))}
      </div>
      <UrlCopyStrip url={url} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ShareButton({ link, code }: ShareButtonProps) {
  const url = link ?? DEFAULT_URL;

  const shareMessage = code
    ? getReferralShareMessage(code)
    : getDefaultShareMessage(url);

  const shareUrl = code ? getReferralUrl(code) : url;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModalView>("picker");


  function handleClose() {
    setOpen(false);
    setTimeout(() => setView("picker"), 200);
  }

async function handleShareClick() {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: "Canadian's Cart",
        text: shareMessage,
        url:shareUrl,
      });
      return;
    } catch {
   
    }
  }

  setView("share");
}

  const titles: Record<ModalView, string> = {
    picker: "Share",
    qr: "QR Code",
    share: "Share via",
  };

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        className="rounded-xl border-green-500 text-green-600 hover:bg-green-50"
        onClick={() => setOpen(true)}
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent
          className="w-full max-w-sm rounded-2xl border border-border bg-background p-0 overflow-hidden gap-0
            sm:rounded-2xl
            max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:max-w-full"
        >
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3 space-y-0">
            {/* Back / close */}
            <button
              onClick={
                view !== "picker" ? () => setView("picker") : handleClose
              }
              className="-ml-1 p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={view !== "picker" ? "Back" : "Close"}
            >
              {view !== "picker" ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>

            <DialogTitle className="text-sm font-semibold text-foreground">
              {titles[view]}
            </DialogTitle>

            <div className="w-7" />
          </DialogHeader>

          {/* Body */}
          <div className="px-5 pb-8">
            {view === "picker" && (
              <PickerView
                onQr={() => setView("qr")}
                onShare={handleShareClick}
              />
            )}
            {view === "qr" && <QrView url={shareUrl} />}
            {view === "share" && (
              <ShareSheetView url={url} shareMessage={shareMessage} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}