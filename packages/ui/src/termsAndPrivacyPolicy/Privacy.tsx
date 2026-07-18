"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowUp,
  Lock,
  Globe,
  CreditCard,
  UserCheck,
  BookOpen,
  Mail,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content?: string;
  bullets?: string[];
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PRIVACY_SECTIONS: Section[] = [
  {
    id: "scope",
    title: "Scope",
    icon: <Globe className="w-4 h-4" />,
    content:
      "This Privacy Policy applies to personal information collected through our app, website, and related services. We operate in British Columbia. Our privacy practices are intended to comply with BC's private-sector privacy law, and where applicable, other Canadian privacy requirements.",
  },
  {
    id: "collect",
    title: "Personal Information We Collect",
    icon: <UserCheck className="w-4 h-4" />,
    content: "We may collect:",
    bullets: [
      "Name and email address",
      "Account credentials or authentication information",
      "Selected store and cart contents",
      "Order history and wallet balance / Gift Wallet activity",
      "MongoDB user ID or internal account identifiers",
      "Payment-related information handled by our payment processor",
      "Device, browser, IP address, log, and usage information",
      "Support messages and communications",
      "Other information you voluntarily provide",
    ],
  },
  {
    id: "use",
    title: "How We Use Personal Information",
    icon: <BookOpen className="w-4 h-4" />,
    content: "We may use personal information to:",
    bullets: [
      "Create and manage your account",
      "Verify your identity and authenticate your access",
      "Show your selected store and eligible items",
      "Process orders and payments",
      "Calculate, apply, or store subsidies and Gift Wallet balances",
      "Provide customer support",
      "Send account, order, and service-related emails",
      "Detect fraud, abuse, or security issues",
      "Comply with legal obligations",
      "Improve and maintain the Service",
    ],
  },
  {
    id: "share",
    title: "How We Share Personal Information",
    icon: <ShieldCheck className="w-4 h-4" />,
    content:
      "We do not sell your personal information. We may share personal information only as needed to operate the Service, including with:",
    bullets: [
      "Your selected store and authorized cashier or store staff, but only the limited information needed to complete a transaction",
      "Service providers such as Stripe, MongoDB, Resend, GoDaddy, Vercel, ImageKit, and Better Auth",
      "Professional advisers, regulators, law enforcement, or courts where required by law",
      "Another entity in connection with a merger, sale, financing, or business reorganization",
    ],
  },
  {
    id: "payment-processing",
    title: "Payment Processing",
    icon: <CreditCard className="w-4 h-4" />,
    content:
      "Payment information is processed by our payment processor and not stored by us in full where avoidable. If you make a payment through the Service, your information may be processed by Stripe or another payment provider subject to its own privacy policy and security practices.",
  },
  {
    id: "cookies",
    title: "Cookies & Similar Technologies",
    icon: <Globe className="w-4 h-4" />,
    content:
      "We may use cookies, session tokens, local storage, and similar technologies to keep you signed in, remember preferences, improve performance, and protect the Service. You can usually control cookies through your browser settings, but some features may not work properly if you disable them.",
  },
  {
    id: "security",
    title: "Data Storage & Security",
    icon: <Lock className="w-4 h-4" />,
    content:
      "We use reasonable administrative, technical, and security measures to help protect personal information from unauthorized access, loss, misuse, or disclosure. Your data is stored using trusted service providers and infrastructure platforms.\n\nWhile we take security seriously, no method of electronic storage or transmission over the internet is completely secure. We cannot guarantee absolute security of your information.",
  },
  {
    id: "retention",
    title: "Retention",
    icon: <BookOpen className="w-4 h-4" />,
    content:
      "We keep personal information only as long as reasonably necessary to provide the Service, maintain business and financial records, meet legal, accounting, or tax obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we delete or de-identify it where reasonable.",
  },
  {
    id: "rights",
    title: "Your Choices & Rights",
    icon: <UserCheck className="w-4 h-4" />,
    content: "Subject to legal limits, you may:",
    bullets: [
      "Request access to personal information we hold about you",
      "Request correction of inaccurate information",
      "Withdraw consent to our collection, use, or disclosure of personal information on reasonable notice",
      "Close your account",
    ],
  },
  {
    id: "children",
    title: "Children",
    icon: <ShieldCheck className="w-4 h-4" />,
    content:
      "The Service is not intended for children who cannot legally enter into contracts. We do not knowingly collect personal information from such children without appropriate authorization.",
  },
  {
    id: "international",
    title: "International Transfers",
    icon: <Globe className="w-4 h-4" />,
    content:
      "Your information may be stored or processed in Canada or other jurisdictions where we or our service providers operate. Those jurisdictions may have laws that require disclosure of information to courts, law enforcement, or government bodies in those places.",
  },
  {
    id: "marketing",
    title: "Marketing Emails",
    icon: <Mail className="w-4 h-4" />,
    content:
      "We may send you account, service, and support emails. We will only send marketing messages where permitted by law and, where required, with consent. You may unsubscribe from marketing emails using the link in the message or by contacting us.",
  },
  {
    id: "policy-changes",
    title: "Changes to This Policy",
    icon: <BookOpen className="w-4 h-4" />,
    content:
      "We may update this Privacy Policy from time to time. If we make material changes, we will take reasonable steps to notify you. Your continued use of the Service after the update takes effect means you accept the revised policy.",
  },
  {
    id: "contact-privacy",
    title: "Contact Us",
    icon: <Mail className="w-4 h-4" />,
    content:
      "To ask questions, make a privacy request, or complain about how we handle personal information, please contact our privacy contact via email.",
  },
];

// ─── SECTION CARD ─────────────────────────────────────────────────────────────

function SectionCard({ section, index }: { section: Section; index: number }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      id={section.id}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-gray-50/60 transition-colors"
      >
        {/* Step number */}
        <span className="flex-none w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] sm:text-xs font-bold flex items-center justify-center">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon chip */}
        <span className="flex-none p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
          {section.icon}
        </span>

        {/* Title */}
        <span className="flex-1 font-semibold text-gray-800 text-sm sm:text-[15px] leading-snug text-left">
          {section.title}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-300 flex-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-50">
          <div className="pt-4 sm:pl-[76px] space-y-3">
            {section.content && (
              <p className="text-gray-500 leading-relaxed text-sm whitespace-pre-line">
                {section.content}
              </p>
            )}
            {section.bullets && (
              <ul className="space-y-2">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-500"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function SidebarNav({
  sections,
  onSelect,
}: {
  sections: Section[];
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className="group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150"
        >
          <span
            className={
              "text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full flex-none bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors"
            }
          >
            {i + 1}
          </span>
          <span className="leading-snug line-clamp-2">{s.title}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Privacy() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (id: string) => {
    const el = document.getElementById(id);
    if (el && mainRef.current) {
      const offset = 0;

      const containerTop = mainRef.current.getBoundingClientRect().top;

      const elTop = el.getBoundingClientRect().top;

      const scrollTop = mainRef.current.scrollTop;

      const target = elTop - containerTop + scrollTop - offset;

      mainRef.current.scrollTo({
        top: target,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const onScroll = () => {
      setShowScrollTop(container.scrollTop > 300);

      const els = PRIVACY_SECTIONS.map((s) =>
        document.getElementById(s.id),
      ).filter(Boolean) as HTMLElement[];

      let current = "";

      for (const el of els) {
        const offsetTop = el.offsetTop;
        const scrollPosition = container.scrollTop;

        if (scrollPosition >= offsetTop - 20) {
          current = el.id;
        }
      }
      // ---
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Lock className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-[15px] sm:text-base leading-none">
                Privacy Policy
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block tracking-wide">
                Effective Date: 19 May 2026 · British Columbia, Canada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full font-medium">
              <Globe className="w-3 h-3" />
              BC, Canada
            </span>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden rounded-xl border-gray-200"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white">
                <SheetHeader className="px-5 py-4 border-b border-gray-100">
                  <SheetTitle className="text-left text-sm font-semibold text-gray-700">
                    Table of Contents
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-72px)] px-3 py-3">
                  <SidebarNav
                    sections={PRIVACY_SECTIONS}
                    onSelect={handleSectionClick}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 max-w-3xl">
            <div className="flex-none">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Data & Privacy
              </div>
            </div>
            <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed">
              This Privacy Policy explains how we collect, use, disclose, store,
              and protect personal information when you use our Service. We
              operate in British Columbia and our practices comply with BC's
              private-sector privacy law and applicable Canadian requirements.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-gray-400">
              {PRIVACY_SECTIONS.length} sections
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400">
              Last updated: 19 May 2026
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
        <div className="flex gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 xl:w-60 shrink-0">
            <div className="sticky top-[84px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">
                Contents
              </p>
              <ScrollArea className="h-[calc(100vh-148px)] pr-1">
                <SidebarNav
                  sections={PRIVACY_SECTIONS}
                  onSelect={handleSectionClick}
                />
              </ScrollArea>
            </div>
          </aside>

          {/* Main */}
          <main
            ref={mainRef}
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 148px)" }}
          >
            <div className="space-y-3">
              {PRIVACY_SECTIONS.map((s, i) => (
                <SectionCard key={s.id} section={s} index={i} />
              ))}

              {/* Footer */}
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-5 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 mb-3">
                  <Mail className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Privacy requests or questions? Contact{" "}
                  <span className="text-emerald-600 font-medium">
                    <a href="mailto:info@canadianscart.ca">
                      info@canadianscart.ca
                    </a>
                  </span>
                  <br className="sm:hidden" />
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to top FAB */}
      {showScrollTop && (
        <button
          onClick={() =>
            mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
