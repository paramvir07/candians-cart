"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Delete, Wallet } from "lucide-react"



const PRESETS = [5, 10, 20, 50, 100, 150, 200, 250]

export function TopUpDialog() {
  const [amount, setAmount] = useState<number | null>(200)
  const [inputVal, setInputVal] = useState("200")

  const handlePreset = (preset: number) => {
    setAmount(preset)
    setInputVal(String(preset))
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputVal(val)
    setAmount(val === "" ? null : Number(val))
  }

  const handleClear = () => {
    setAmount(null)
    setInputVal("")
  }

 const handleCheckout = async () => {
  if (!amount) return;

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amount * 100, 
    }),
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  }
};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full rounded-full p-5">Top Up</Button>
      </DialogTrigger>
      <DialogTitle>
        
      </DialogTitle>

      <DialogContent
        className="sm:max-w-sm p-0 overflow-hidden gap-0 border-0"
        style={{
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header strip */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-secondary)" }}
            >
              <Wallet size={14} style={{ color: "var(--color-primary)" }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Top Up Wallet</p>
          </div>
          <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">CAD</p>
        </div>

        <div className="p-5 pb-4 space-y-5">
          {/* Amount display */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: "var(--color-secondary)" }}
          >
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light"
                style={{ color: "var(--color-primary)", opacity: 0.6 }}
              >
                $
              </span>
              <input
                type="number"
                value={inputVal}
                onChange={handleInput}
                placeholder="0"
                className="text-4xl font-bold bg-transparent border-none outline-none w-36 placeholder:text-gray-300"
                style={{
                  color: "var(--color-foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}
              />
            </div>
            <button
              onClick={handleClear}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: inputVal ? "var(--color-primary)" : "rgba(0,0,0,0.06)",
              }}
            >
              <Delete
                size={14}
                style={{ color: inputVal ? "var(--color-primary-foreground)" : "#aaa" }}
              />
            </button>
          </div>

          {/* Presets */}
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2.5">Quick Select</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = amount === preset && inputVal === String(preset)
                return (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
                    style={{
                      background: isSelected ? "var(--color-primary)" : "var(--color-secondary)",
                      color: isSelected ? "var(--color-primary-foreground)" : "var(--color-secondary-foreground)",
                      fontWeight: isSelected ? 700 : 500,
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                      boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    ${preset}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Summary line */}
          {amount && (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--color-secondary)" }}
            >
              <span style={{ color: "var(--color-muted-foreground)" }}>You're adding</span>
              <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                ${amount.toFixed(2)} CAD
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <Button
            disabled={!amount}
            onClick={handleCheckout}
            className="w-full py-5 rounded-2xl font-bold text-base transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              boxShadow: amount ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {amount ? `Top Up $${amount.toFixed(2)}` : "Enter an Amount"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}