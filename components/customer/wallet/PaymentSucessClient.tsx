"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

const DURATION = 3000

export default function PaymentSuccessClient() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [checkDrawn, setCheckDrawn] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 50)
    const t2 = setTimeout(() => setCheckDrawn(true), 400)

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        router.push("/customer/wallet")
      }
    }

    const t3 = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate)
    }, 600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [router])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#f3f1ed]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Top accent line */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px]"
        style={{
          background: "oklch(0.6271 0.1699 149.2138)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease 0.2s",
        }}
      />

      {/* Main container */}
      <div
        className="flex flex-col items-center w-full max-w-[380px] px-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >

        {/* Animated check circle */}
        <div className="relative mb-10">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="oklch(0.9669 0.0287 158.0617)" />
            <circle
              cx="32" cy="32" r="30"
              stroke="oklch(0.6271 0.1699 149.2138)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="188.5"
              strokeDashoffset={checkDrawn ? "0" : "188.5"}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s",
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
            />
            <polyline
              points="20,33 28,41 44,25"
              stroke="oklch(0.6271 0.1699 149.2138)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="36"
              strokeDashoffset={checkDrawn ? "0" : "36"}
              style={{
                transition: "stroke-dashoffset 0.4s cubic-bezier(0.16,1,0.3,1) 0.7s",
              }}
            />
          </svg>
        </div>

        {/* Text block */}
        <div className="text-center mb-8 space-y-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "oklch(0.6271 0.1699 149.2138)" }}
          >
            Payment complete
          </p>
          <h1
            className="text-[28px] font-semibold"
            style={{
              color: "oklch(0.2661 0.0625 153.0394)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Wallet updated
          </h1>
          <p
            className="text-sm"
            style={{ color: "oklch(0.5252 0.0315 157.3462)", letterSpacing: "-0.01em" }}
          >
            Your balance is ready to use
          </p>
        </div>

        {/* Separator */}
        <div
          className="w-full mb-8"
          style={{ height: "1px", background: "oklch(0.9324 0.0207 158.2303)" }}
        />

        {/* CTA */}
        <button
          onClick={() => router.push("/customer/wallet")}
          className="w-full rounded-xl text-sm font-medium"
          style={{
            background: "oklch(0.2661 0.0625 153.0394)",
            color: "#fff",
            padding: "13px 20px",
            letterSpacing: "-0.01em",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            boxShadow: "0 1px 2px oklch(0.2661 0.0625 153.0394 / 0.2)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = "translateY(-1px)"
            el.style.boxShadow = "0 4px 12px oklch(0.2661 0.0625 153.0394 / 0.25)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = "translateY(0)"
            el.style.boxShadow = "0 1px 2px oklch(0.2661 0.0625 153.0394 / 0.2)"
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(0.99)"
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
          }}
        >
          Go to Wallet
        </button>

        {/* Auto-redirect progress */}
        <div className="mt-5 flex items-center gap-2.5 w-full">
          <div
            className="flex-1 h-[2px] rounded-full overflow-hidden"
            style={{ background: "oklch(0.9324 0.0207 158.2303)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "oklch(0.6271 0.1699 149.2138 / 0.5)",
              }}
            />
          </div>
          <span
            className="text-xs tabular-nums shrink-0"
            style={{ color: "oklch(0.5252 0.0315 157.3462)", letterSpacing: "-0.01em" }}
          >
            {Math.max(0, Math.ceil(((100 - progress) / 100) * (DURATION / 1000)))}s
          </span>
        </div>
      </div>

      {/* Bottom trust anchor */}
      <div
        className="fixed bottom-8 flex items-center gap-1.5"
        style={{
          opacity: mounted ? 0.4 : 0,
          transition: "opacity 0.5s ease 0.8s",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.6271 0.1699 149.2138)" }}
        />
        <span
          className="text-[11px] font-medium tracking-widest"
          style={{ color: "oklch(0.5252 0.0315 157.3462)" }}
        >
          CANDIAN'S CART
        </span>
      </div>
    </div>
  )
}