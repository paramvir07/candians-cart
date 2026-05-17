"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Mail,
  ArrowUpRight,
  Users,
  Leaf,
  Heart,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — edit this to add / remove / change job postings.
// When you wire up a backend, replace this array with an API fetch.
// ─────────────────────────────────────────────────────────────────────────────
export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Volunteer";
  salary?: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  posted: string;
}

const JOB_POSTINGS: JobPosting[] = [
  {
    id: "driver-abbotsford",
    title: "Delivery Driver",
    department: "Logistics",
    location: "Abbotsford, BC",
    type: "Part-Time",
    salary: "$18 – $22 / hr",
    summary:
      "Pick up and deliver grocery packs to families across Abbotsford. A friendly face that represents Candian's Cart in the community.",
    description:
      "As a Delivery Driver you'll be the final — and most memorable — touchpoint for our families. You'll collect pre-packed grocery orders from our fulfilment hub and deliver them on time with care and a smile.",
    responsibilities: [
      "Pick up packed orders from the fulfilment hub on schedule.",
      "Deliver grocery packs to customers within the assigned route.",
      "Verify order accuracy before leaving the hub.",
      "Handle perishables safely and maintain cold-chain where required.",
      "Communicate any delivery issues to dispatch promptly.",
      "Collect signatures / confirmations and update delivery status in the app.",
    ],
    requirements: [
      "Valid BC Class 5 driver's licence (clean abstract).",
      "Access to a reliable vehicle (van or SUV preferred).",
      "Able to lift up to 25 kg comfortably.",
      "Excellent time-management and communication skills.",
      "Smartphone with data plan for the delivery app.",
    ],
    niceToHave: [
      "Previous courier or grocery delivery experience.",
      "Familiarity with Abbotsford neighbourhoods.",
    ],
    posted: "May 2025",
  },
  {
    id: "picker-packer",
    title: "Grocery Picker & Packer",
    department: "Operations",
    location: "Abbotsford, BC",
    type: "Part-Time",
    salary: "$17 – $20 / hr",
    summary:
      "Assemble accurate, high-quality grocery packs at our fulfilment hub, making sure every family receives exactly what they ordered.",
    description:
      "You'll work inside our fulfilment hub preparing grocery packs ahead of delivery windows. Accuracy, speed, and care for food quality are the keys to success in this role.",
    responsibilities: [
      "Pick grocery items from shelves/cold storage using a digital pick-list.",
      "Pack orders neatly and ensure fragile items are protected.",
      "Perform quality checks — correct items, correct quantities, no damaged goods.",
      "Maintain cleanliness and organisation in the packing area.",
      "Flag inventory shortages to the team lead.",
      "Assist with receiving and storing supplier deliveries.",
    ],
    requirements: [
      "Ability to stand for extended periods and lift up to 20 kg.",
      "High attention to detail and accuracy.",
      "Comfortable using a tablet or smartphone app.",
      "Reliable and punctual — shifts begin early morning.",
    ],
    niceToHave: [
      "Experience in a grocery, warehouse, or food-service environment.",
      "Food Safe Level 1 certificate.",
    ],
    posted: "May 2025",
  },
  {
    id: "customer-support",
    title: "Customer Support Specialist",
    department: "Customer Experience",
    location: "Remote (BC, Canada)",
    type: "Part-Time",
    salary: "$17 – $19 / hr",
    summary:
      "Be the friendly voice behind Candian's Cart — helping families with orders, accounts, and anything else they need.",
    description:
      "Our customers rely on us for their weekly groceries, and you'll make sure their experience is smooth and delightful. You'll handle inbound queries via email and chat, resolve issues, and proactively improve our support processes.",
    responsibilities: [
      "Respond to customer emails and live-chat messages within SLA.",
      "Resolve order issues, billing questions, and account problems.",
      "Escalate complex cases to the appropriate team with full context.",
      "Maintain accurate records in our CRM.",
      "Identify recurring issues and suggest process improvements.",
      "Assist with onboarding new customers to the platform.",
    ],
    requirements: [
      "Excellent written communication in English.",
      "Empathetic, patient, and solution-focused approach.",
      "Comfortable working independently in a remote setting.",
      "Reliable internet connection and a quiet workspace.",
    ],
    niceToHave: [
      "Bilingual (English / Punjabi or English / French).",
      "Previous customer support or retail experience.",
      "Familiarity with help-desk tools (Freshdesk, Intercom, etc.).",
    ],
    posted: "May 2025",
  },
  {
    id: "social-media",
    title: "Social Media & Content Creator",
    department: "Marketing",
    location: "Remote (BC, Canada)",
    type: "Contract",
    salary: "$20 – $28 / hr",
    summary:
      "Tell the Candian's Cart story across Instagram and beyond — growing our community with authentic, engaging content.",
    description:
      "We're looking for a creative self-starter to own our social media presence. You'll plan, create, and publish content that resonates with Canadian families — showcasing our mission, products, and community impact.",
    responsibilities: [
      "Develop and execute a monthly content calendar.",
      "Shoot, edit, and publish Reels, Stories, and static posts for Instagram.",
      "Engage with followers — respond to comments and DMs.",
      "Track analytics and report on growth and engagement monthly.",
      "Collaborate with the team on seasonal campaigns and promotions.",
      "Source UGC and coordinate with community members for testimonials.",
    ],
    requirements: [
      "Strong portfolio of social media content (food, lifestyle, or community preferred).",
      "Proficiency with Instagram and short-form video editing (CapCut, Reels, etc.).",
      "Understanding of Canadian / South-Asian family demographics is a plus.",
      "Self-directed with strong creative instincts.",
    ],
    niceToHave: [
      "Experience with photography or videography.",
      "Knowledge of SEO and hashtag strategy.",
      "Experience working with small or local brands.",
    ],
    posted: "May 2025",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens — matching your site's green palette exactly
// #1a3a1a-ish dark green headings, #16a34a bright green primary
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT_EMAIL = "info@canadianscart.ca";

const TYPE_META: Record<JobPosting["type"], { pill: string; dot: string }> = {
  "Full-Time":  { pill: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-500" },
  "Part-Time":  { pill: "bg-sky-50 text-sky-700 border-sky-200",        dot: "bg-sky-500" },
  Contract:     { pill: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
  Volunteer:    { pill: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
};

// Coloured monogram backgrounds per department
const DEPT_STYLE: Record<string, { bg: string; text: string }> = {
  Logistics:            { bg: "bg-orange-100",  text: "text-orange-600" },
  Operations:           { bg: "bg-teal-100",    text: "text-teal-600" },
  "Customer Experience":{ bg: "bg-blue-100",    text: "text-blue-600" },
  Marketing:            { bg: "bg-pink-100",    text: "text-pink-600" },
};

function buildMailto(job: JobPosting) {
  const subject = encodeURIComponent(`Application – ${job.title}`);
  const body = encodeURIComponent(
    `Hi Candian's Cart team,\n\nI'm interested in applying for the ${job.title} (${job.type}) position in ${job.location}.\n\nPlease find my details below:\n\nName:\nPhone:\nLinkedIn / Portfolio:\n\n[Attach your resume]\n\nLooking forward to hearing from you!`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 700) {
  const [count, setCount] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — matches your homepage's pill/card style
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <p className="text-[15px] font-black text-[#1a3a1a] leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JobCard
// ─────────────────────────────────────────────────────────────────────────────
function JobCard({ job, index, onClick }: { job: JobPosting; index: number; onClick: () => void }) {
  const meta = TYPE_META[job.type];
  const dept = DEPT_STYLE[job.department] ?? { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <button
      onClick={onClick}
      className="group text-left w-full relative rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-green-400 hover:shadow-[0_4px_24px_-4px_rgba(22,163,74,0.18)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 cc-fadein"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3.5 mb-4">
        {/* Dept monogram */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-black shrink-0 ${dept.bg} ${dept.text}`}>
          {job.department.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-gray-400 mb-0.5">
            {job.department}
          </p>
          <h3 className="text-[15px] font-bold text-[#1a3a1a] leading-snug group-hover:text-green-700 transition-colors pr-5">
            {job.title}
          </h3>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 mt-0.5" />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-5">
        {job.summary}
      </p>

      {/* Footer row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {job.type}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <MapPin className="w-3 h-3" /> {job.location}
        </span>
        {job.salary && (
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <DollarSign className="w-3 h-3" /> {job.salary}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-300">
          <Clock className="w-3 h-3" /> {job.posted}
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
      {children}
    </p>
  );
}

function JobDrawer({ job, open, onClose }: { job: JobPosting | null; open: boolean; onClose: () => void }) {
  if (!job) return null;
  const meta = TYPE_META[job.type];
  const dept = DEPT_STYLE[job.department] ?? { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] flex flex-col p-0 overflow-hidden bg-white"
      >
        {/* Sticky header */}
        <div className="shrink-0 px-7 pt-7 pb-5 border-b border-gray-100 bg-white">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${dept.bg} ${dept.text}`}>
                {job.department.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-gray-400">
                  {job.department}
                </p>
                <SheetTitle className="text-xl font-black text-[#1a3a1a] leading-tight mt-0.5">
                  {job.title}
                </SheetTitle>
              </div>
            </div>
            <SheetDescription asChild>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {job.type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                {job.salary && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                    <DollarSign className="w-3 h-3" /> {job.salary}
                  </span>
                )}
              </div>
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          <div>
            <SectionLabel>About the Role</SectionLabel>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          <Separator className="bg-gray-100" />

          <div>
            <SectionLabel>Responsibilities</SectionLabel>
            <ul className="space-y-2.5">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="bg-gray-100" />

          <div>
            <SectionLabel>Requirements</SectionLabel>
            <ul className="space-y-2.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {job.niceToHave && job.niceToHave.length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              <div>
                <SectionLabel>Nice to Have</SectionLabel>
                <ul className="space-y-2.5">
                  {job.niceToHave.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-300" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Sticky apply footer */}
        <div className="shrink-0 border-t border-gray-100 px-7 py-5 bg-white">
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xs font-bold text-green-800 uppercase tracking-widest">
                How to Apply
              </p>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Send your resume to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>{" "}
              with subject{" "}
              <span className="font-semibold">"Application – {job.title}"</span>.
            </p>
          </div>
          <Button
            asChild
            className="w-full gap-2 h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            <a href={buildMailto(job)}>
              <Mail className="w-4 h-4" />
              Apply via Email
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CareersPage() {
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const count = useCountUp(JOB_POSTINGS.length);

  return (
    <>
      <style>{`
        /* Match site dot-grid texture */
        .cc-dotgrid {
          background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
          background-size: 24px 24px;
        }
        @keyframes ccFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cc-fadein {
          animation: ccFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        /* Shimmer on the green headline word */
        @keyframes ccShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cc-shimmer {
          background: linear-gradient(90deg, #15803d 0%, #4ade80 45%, #15803d 60%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ccShimmer 3.5s linear infinite;
        }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══════════════════════ HERO ══════════════════════ */}
        <section className="relative overflow-hidden border-b border-gray-100">
          {/* Dot grid — same as homepage */}
          <div aria-hidden className="cc-dotgrid pointer-events-none absolute inset-0 opacity-40" />

          {/* Soft green radial glow top-right (homepage signature) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(220,252,231,0.7) 0%, transparent 70%)" }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">

            {/* Eyebrow pill — matches your site's pill style exactly */}
            <div className="cc-fadein flex justify-center mb-7" style={{ animationDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                We're Hiring · {count} Open Role{JOB_POSTINGS.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Headline — dark green bold like homepage */}
            <h1
              className="cc-fadein text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.06] text-[#1a3a1a] mb-5"
              style={{ animationDelay: "60ms" }}
            >
              Join the team behind{" "}<br />
              <span className="block sm:inline cc-shimmer">Candian's Cart</span>
            </h1>

            {/* Subhead */}
            <p
              className="cc-fadein text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10"
              style={{ animationDelay: "120ms" }}
            >
              We're building a more affordable, community-first way for Canadian
              families to shop for groceries. Every person on our team makes
              that mission real.
            </p>

            {/* Stat cards */}
            <div
              className="cc-fadein flex flex-wrap justify-center gap-3"
              style={{ animationDelay: "180ms" }}
            >
              <StatCard icon={Users}  value={`${JOB_POSTINGS.length} Roles`} label="Currently open" />
              <StatCard icon={MapPin} value="Abbotsford" label="+ Remote options" />
              <StatCard icon={Heart}  value="Mission"    label="Driven team" />
            </div>
          </div>
        </section>

        {/* ══════════════════════ LISTINGS ══════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-green-600 mb-1">
                Opportunities
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1a3a1a] tracking-tight">
                Open Positions
              </h2>
            </div>
            <p className="text-sm text-gray-400">Click any role to see full details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {JOB_POSTINGS.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} onClick={() => setSelected(job)} />
            ))}
          </div>
        </section>

        {/* ══════════════════════ VALUES STRIP ══════════════════════ */}
        <section className="border-y border-gray-100 bg-gray-50/60 py-10 sm:py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Leaf,  title: "Real Impact",       desc: "Your work directly helps families afford quality groceries every week." },
                { icon: Users, title: "Small & Tight-Knit", desc: "No bureaucracy. Your ideas matter and get shipped fast." },
                { icon: Heart, title: "Community First",   desc: "We're rooted in Abbotsford and proud of the community we serve." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a3a1a] mb-1">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ OPEN APPLICATION BANNER ══════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden p-8 sm:p-12 shadow-sm">
            {/* Green blob decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full translate-x-1/3 -translate-y-1/3"
              style={{ background: "radial-gradient(circle, rgba(220,252,231,0.8) 0%, transparent 70%)" }}
            />
            {/* Dot grid accent */}
            <div
              aria-hidden
              className="cc-dotgrid pointer-events-none absolute inset-0 opacity-30 rounded-3xl"
            />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-md">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-green-600 mb-2">
                  Open Application
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1a3a1a] tracking-tight mb-3">
                  Don't see your role?
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We're always open to hearing from passionate, talented people.
                  Tell us who you are and how you'd help us grow.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 h-12 px-6 text-sm font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  <a href={`mailto:${CONTACT_EMAIL}?subject=General%20Application`}>
                    <Mail className="w-4 h-4" />
                    Get in Touch
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <p className="text-xs text-gray-400">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-green-600 transition-colors underline underline-offset-2"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Drawer */}
        <JobDrawer job={selected} open={!!selected} onClose={() => setSelected(null)} />
      </main>
    </>
  );
}