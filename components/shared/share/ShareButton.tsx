"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_URL = "https://www.canadianscart.ca";

interface AppConfig {
  label: string;
  bg: string;
  icon: React.ReactNode;
  href: (url: string) => string;
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
    href: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    label: "X",
    bg: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: (url) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
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
    href: (url) =>
      `mailto:?subject=Check this out&body=${encodeURIComponent(url)}`,
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
    href: (url) => `sms:?body=${encodeURIComponent(url)}`,
  },
];

interface ShareButtonProps {
  link?: string;
}

export default function ShareButton({ link }: ShareButtonProps) {
  const url = link ?? DEFAULT_URL;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMobile = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    if (isMobile) {
      // Native OS share sheet on mobile/tablet — no custom UI needed
      try {
        await navigator.share({ url });
      } catch {
        // User cancelled or share failed — do nothing
      }
    } else {
      // Desktop — show custom dialog
      setOpen(true);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        className="rounded-xl border-green-500 text-green-600 hover:bg-green-50"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {/* Desktop dialog — only rendered on non-mobile */}
      {!isMobile && open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center text-sm text-gray-500">
              Share this page
            </p>

            {/* App icons */}
            <div className="mb-5 flex justify-around">
              {APPS.map((app) => (
                <a
                  key={app.label}
                  href={app.href(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: app.bg }}
                  >
                    {app.icon}
                  </span>
                  <span className="text-[11px] text-gray-500">{app.label}</span>
                </a>
              ))}
            </div>

            {/* Copy link row */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs text-gray-400">
                {url}
              </span>
              <Button
                size="sm"
                className={
                  copied
                    ? "rounded-lg border border-green-400 bg-green-100 text-xs text-green-700"
                    : "rounded-lg bg-green-600 text-xs text-white hover:bg-green-700"
                }
                onClick={copyLink}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
