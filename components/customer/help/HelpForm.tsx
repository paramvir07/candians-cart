"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"
import {
  Bug, HelpCircle, Sparkles, MessageCircle,
  CheckCircle2, ChevronLeft, Wallet,
} from "lucide-react"
import { ReportSubmit } from "@/actions/customer/Reportaction"
import CustomerAdvertisements from "../shared/CustomerAdvertisements"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

type Category = "bug" | "question" | "feature" | "other"

const CATEGORIES: {
  id: Category
  label: string
  icon: React.ElementType
  tag?: string
}[] = [
  { id: "bug",      label: "Bug Report",      icon: Bug,          
    // tag: "+$10 reward" 
  },
  { id: "question", label: "Question",         icon: HelpCircle },
  { id: "feature",  label: "Feature Request",  icon: Sparkles },
  { id: "other",    label: "Other",            icon: MessageCircle },
]

const MAX_CHARS = 2000

export default function HelpForm({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [category, setCategory] = useState<Category>("question")
  const [subject, setSubject]   = useState("")
  const [message, setMessage]   = useState("")
  const [email]                 = useState(userEmail)
  const [focused, setFocused]   = useState<string | null>(null)

  const [state, formAction, pending] = useActionState(ReportSubmit, {
    success: false,
    errors: {},
  })

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/customer"), 3000)
      return () => clearTimeout(t)
    }
  }, [state.success, router])

  const placeholders: Record<Category, string> = {
    bug:      "Steps to reproduce, expected vs actual behaviour, device/browser info…",
    question: "What would you like to know? Include any relevant context…",
    feature:  "Describe the problem you're trying to solve and your proposed solution…",
    other:    "Tell us what's on your mind…",
  }

  type Field = "email" | "subject" | "message" | "category"

  const fieldCls = (f: Field) => [
    "w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all duration-150",
    "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
    f === "email"
      ? "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] cursor-default select-none"
      : state.errors?.[f]
        ? "bg-white border-red-300 ring-2 ring-red-100"
        : focused === f
          ? "bg-white border-[var(--primary)] ring-2 ring-[var(--primary)]/10"
          : "bg-white border-[var(--border)] hover:border-[var(--primary)]/40",
  ].join(" ")

  const categoryLabel = CATEGORIES.find(c => c.id === category)?.label ?? category

  return (
    <div className={`${jakarta.className} min-h-[calc(100vh-64px)] grid`}>
      <main className="flex flex-col bg-[var(--background)] border-l border-[var(--border)]">

        {/* back button */}
        <div className="px-8 sm:px-12 pt-6">
          <button
            type="button"
            onClick={() => router.push("/customer")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <form action={formAction} className="contents">

          {state.success ? (

            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--secondary)" }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: "var(--primary)" }} />
              </div>
              <div className="max-w-sm">
                <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">
                  We&apos;ve got your message
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Your{" "}
                  <span className="font-semibold text-[var(--foreground)]">{categoryLabel}</span>
                  {" "}has been logged. We&apos;ll reply to{" "}
                  <span className="font-semibold text-[var(--foreground)]">{email}</span>
                  {" "}within 24 hours.
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-3">Redirecting you home…</p>
              </div>
            </div>

          ) : (

            <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-8 sm:px-12 py-12 gap-8">

              {/* header */}
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-2">
                  Submit a request
                </p>
                <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  What&apos;s on your mind?
                </h2>
              </div>

              {/* category */}
              <div>
                <label className="block text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted-foreground)] mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => {
                    const Icon = c.icon
                    const active = category === c.id
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={[
                          "relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150",
                          active
                            ? "border-[var(--primary)] bg-[var(--secondary)] shadow-sm"
                            : "border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--secondary)]/50",
                        ].join(" ")}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: active ? "var(--primary)" : "var(--muted)" }}
                        >
                          <Icon className="h-4 w-4"
                            style={{ color: active ? "white" : "var(--muted-foreground)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-tight ${active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                            {c.label}
                          </p>
                          {c.tag && (
                            <p className="text-[10px] font-semibold mt-0.5"
                              style={{ color: "var(--primary)" }}>
                              {c.tag}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" name="category" value={category} />
              </div>

              {/* bug reward banner */}
              {/* {category === "bug" && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[var(--primary)]/20 bg-[var(--secondary)]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--primary)" }}>
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Earn $10 for a valid bug
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                      If your report identifies a legitimate bug, we&apos;ll credit{" "}
                      <span className="font-medium text-[var(--foreground)]">$10</span> directly to your wallet. Include clear steps to reproduce for the best chance of approval.
                    </p>
                  </div>
                </div>
              )} */}
<CustomerAdvertisements />
              {/* email */}
              <div>
                <label className="block text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted-foreground)] mb-2">
                  Email
                </label>
                <input
                  name="email"
                  value={email}
                  readOnly
                  tabIndex={-1}
                  className={fieldCls("email")}
                />
                {state.errors?.email && (
                  <p className="mt-1.5 text-xs text-red-500">{state.errors.email[0]}</p>
                )}
              </div>

              {/* subject */}
              <div>
                <label className="block text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted-foreground)] mb-2">
                  Subject
                </label>
                <input
                  name="subject"
                  value={subject}
                  placeholder="Brief summary of your request"
                  onChange={e => setSubject(e.target.value)}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                  className={fieldCls("subject")}
                />
                {state.errors?.subject && (
                  <p className="mt-1.5 text-xs text-red-500">{state.errors.subject[0]}</p>
                )}
              </div>

              {/* message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted-foreground)]">
                    Message
                  </label>
                  <span className={`text-xs tabular-nums transition-colors ${message.length >= MAX_CHARS ? "text-red-400 font-semibold" : "text-[var(--muted-foreground)]"}`}>
                    {message.length}/{MAX_CHARS}
                  </span>
                </div>
                <textarea
                  name="message"
                  value={message}
                  placeholder={placeholders[category]}
                  maxLength={MAX_CHARS}
                  rows={6}
                  onChange={e => setMessage(e.target.value)}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  className={`${fieldCls("message")} resize-none`}
                />
                {state.errors?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{state.errors.message[0]}</p>
                )}
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={pending}
                className="h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-opacity duration-150 disabled:opacity-60"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {pending ? "Sending…" : "Send message"}
              </button>

            </div>
          )}

        </form>
      </main>
    </div>
  )
}