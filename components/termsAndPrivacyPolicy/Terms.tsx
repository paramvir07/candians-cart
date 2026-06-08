"use client"

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
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowUp,
  Lock,
  Globe,
  CreditCard,
  UserCheck,
  AlertCircle,
  BookOpen,
  Mail,
  Building2,
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

const TERMS_SECTIONS: Section[] = [
  {
    id: "eligibility",
    title: "Eligibility",
    icon: <UserCheck className="w-4 h-4" />,
    content:
      "You must have the legal capacity to enter into a contract in your jurisdiction to use the Service. By using the Service, you represent that you meet that requirement.",
  },
  {
    id: "account",
    title: "Account Registration",
    icon: <UserCheck className="w-4 h-4" />,
    content:
      "To use some features, you must create an account and provide accurate, current, and complete information. You are responsible for keeping your account credentials confidential and for all activity under your account.\n\nYou may be required to verify your email address or other account details before accessing the Service.",
  },
  {
    id: "store",
    title: "Selected Store",
    icon: <Building2 className="w-4 h-4" />,
    content:
      "When you choose a store, that selection is final. You may not change your selected store after account creation unless we expressly allow it in writing.\n\nYou are responsible for choosing the store that is most convenient for you before completing registration.",
  },
  {
    id: "service",
    title: "Service Description",
    icon: <Globe className="w-4 h-4" />,
    content:
      "The Service helps users browse items, place or prepare grocery orders, and use eligible subsidies on selected items at participating stores.",
    bullets: [
      "Some items may be marked as subsidized",
      "Subsidies may be available only when your order meets eligibility thresholds",
      "Subsidies may be used immediately in the order or saved in your Gift Wallet for future use",
      "Subsidies and similar promotional benefits are not cash and are not transferable unless we expressly allow it",
    ],
  },
  {
    id: "subsidies",
    title: "Promotional Savings, Subsidies & Gift Wallet",
    icon: <CreditCard className="w-4 h-4" />,
    content:
      "We may offer subsidies, rewards, or similar promotional benefits based on your purchases of eligible regular items. Any description of potential savings or benefits is an estimate or promotion only unless we expressly confirm otherwise in writing.",
    bullets: [
      "Subsidies apply only to eligible subsidized items",
      "Subsidies may depend on minimum purchase thresholds",
      "Unused subsidies may be stored in your Gift Wallet",
      "Gift Wallet balances may be subject to limits, eligibility rules, and expiration where permitted by law",
      "We may modify or discontinue any promotional program at any time, subject to applicable law",
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: <CreditCard className="w-4 h-4" />,
    content:
      "Payments may be processed through third-party providers, including Stripe. By using the Service, you authorize us and our payment processors to charge the applicable amounts for your order, fees, taxes, or other charges shown to you before checkout.\n\nYou agree to provide a valid payment method and to pay all amounts due. If a payment fails or is reversed, we may suspend or cancel your order or account.",
  },
  {
    id: "instore",
    title: "In-Store Use & Cashier Access",
    icon: <UserCheck className="w-4 h-4" />,
    content:
      "You may use the Service to shop in the app or in store at your selected location. When needed to complete an order, a cashier or authorized store staff may view limited information, including your name, account ID, wallet details, and cart details. We do not authorize stores or cashiers to use your data for their own unrelated purposes.",
  },
  {
    id: "thirdparty",
    title: "Third-Party Services",
    icon: <Globe className="w-4 h-4" />,
    content:
      "The Service may rely on third-party services including MongoDB, Resend, GoDaddy, Vercel, ImageKit, Better Auth, Stripe, and others. Third-party services are governed by their own terms and privacy policies. We are not responsible for outages, errors, or actions caused by third-party services outside our reasonable control.",
  },
  {
    id: "acceptable",
    title: "Acceptable Use",
    icon: <AlertCircle className="w-4 h-4" />,
    content: "You agree not to:",
    bullets: [
      "Use the Service unlawfully",
      "Attempt to access another user's account",
      "Interfere with the security or operation of the Service",
      "Submit false, fraudulent, or misleading information",
      "Abuse subsidies or promotions",
      "Share, sell, split, transfer, or monetize referral rewards, codes, subsidies, or promotional credits unless expressly authorized",
      "Use automated tools to scrape, copy, or disrupt the Service without permission",
    ],
  },
  {
    id: "termination",
    title: "Suspension & Termination",
    icon: <AlertCircle className="w-4 h-4" />,
    content:
      "We may suspend, restrict, or terminate your account at any time if we believe you violated these Terms, misused the Service, committed fraud, or created legal, financial, or security risk.\n\nYou may stop using the Service at any time. Certain obligations in these Terms will continue after termination.",
  },
  {
    id: "ip",
    title: "Intellectual Property",
    icon: <ShieldCheck className="w-4 h-4" />,
    content:
      "The Service, including our software, app design, branding, logos, user interface, and original content, is owned by us or licensed to us and protected by applicable intellectual property laws. You may not copy, modify, distribute, sell, lease, reverse engineer, or misuse any part of the Service except where permitted by law or with our written permission.",
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    icon: <AlertCircle className="w-4 h-4" />,
    content:
      'The Service is provided on an "as is" and "as available" basis to the extent permitted by applicable law. We do not guarantee:',
    bullets: [
      "Uninterrupted access to the Service",
      "That all errors or bugs will be corrected immediately",
      "Continuous availability of subsidies, promotions, or wallet benefits",
      "That estimated savings will always be achieved",
      "Uninterrupted operation of third-party services",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    icon: <AlertCircle className="w-4 h-4" />,
    content:
      "To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or lost savings. To the extent liability cannot be excluded, our total liability will be limited to the amount you paid us for the transaction giving rise to the claim.",
  },
  {
    id: "indemnity",
    title: "Indemnity",
    icon: <ShieldCheck className="w-4 h-4" />,
    content:
      "You agree to indemnify and hold harmless us, our affiliates, officers, directors, employees, and service providers from claims, losses, damages, liabilities, and expenses arising from your misuse of the Service, your violation of these Terms, or your violation of any law or third-party rights.",
  },
  {
    id: "privacy-ref",
    title: "Privacy",
    icon: <Lock className="w-4 h-4" />,
    content:
      "Our collection, use, disclosure, and protection of personal information are described in our Privacy Policy, which forms part of these Terms.",
  },
  {
    id: "changes",
    title: "Changes to Service or Terms",
    icon: <BookOpen className="w-4 h-4" />,
    content:
      "We may update the Service or these Terms at any time. If changes are material, we will take reasonable steps to notify you. Your continued use of the Service after changes take effect means you accept the updated Terms.",
  },
  {
    id: "governing",
    title: "Governing Law",
    icon: <Globe className="w-4 h-4" />,
    content:
      "These Terms are governed by the laws of British Columbia and the federal laws of Canada applicable in British Columbia, without regard to conflict of law rules.",
  },
  {
    id: "contact-terms",
    title: "Contact",
    icon: <Mail className="w-4 h-4" />,
    content:
      "Questions about these Terms can be sent to our support email.",
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
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
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

export default function Terms() {
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

      const els = TERMS_SECTIONS.map((s) =>
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
              <FileText className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-[15px] sm:text-base leading-none">
                Terms & Conditions
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
                <Button variant="outline" size="icon" className="lg:hidden rounded-xl border-gray-200">
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
                    sections={TERMS_SECTIONS}
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
                Legal Agreement
              </div>
            </div>
            <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed">
              These Terms govern your access to and use of our app, website, and related services.
              By creating an account or using the Service in any way, you agree to these Terms and
              our Privacy Policy. If you do not agree, do not use the Service.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-gray-400">
              {TERMS_SECTIONS.length} sections
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400">Last updated: 19 May 2026</span>
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
                  sections={TERMS_SECTIONS}
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
              {TERMS_SECTIONS.map((s, i) => (
                <SectionCard key={s.id} section={s} index={i} />
              ))}

              {/* Footer */}
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-5 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 mb-3">
                  <Mail className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Questions about these Terms?{" "}
                  <span className="font-semibold">Contact <span className="text-emerald-600 font-medium"><a href="mailto:info@canadianscart.ca">info@canadianscart.ca</a></span></span>
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
          onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}