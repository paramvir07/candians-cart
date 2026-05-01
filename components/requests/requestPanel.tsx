"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { acceptRequest, resolveRequest } from "@/actions/admin/Requests/request";
import { IReport, ReportCategory } from "@/db/models/customer/Report.model";
import { IContact, ContactTopic } from "@/db/models/customer/Contact.model";
import { cn } from "@/lib/utils";
import {
  Bug,
  HelpCircle,
  Sparkles,
  MoreHorizontal,
  MessageSquare,
  Tag,
  Wrench,
  Handshake,
  ChevronDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  Loader2,
  Inbox,
  MailCheck,
  Phone,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "contact" | "help";
type View = "ongoing" | "resolved";
type Stage = "new" | "accepted" | "resolved";

type HelpItem = IReport & { _id: string; createdAt: string };
type ContactItem = IContact & { _id: string; createdAt: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const HELP_CATEGORIES: ReportCategory[] = ["bug", "question", "feature", "other"];
const CONTACT_TOPICS: ContactTopic[] = [
  "General Inquiry",
  "Savings & Pricing",
  "Gift Wallet & Rewards",
  "Technical Support",
  "Partnership",
  "Other",
];

type CatMeta = { pill: string; dropdownIcon: string; icon: React.ReactNode; label: string };
const CATEGORY_META: Record<string, CatMeta> = {
  bug:                    { pill: "bg-rose-500 text-white border-rose-600",         dropdownIcon: "bg-rose-100 text-rose-600 border-rose-200",     icon: <Bug className="w-3 h-3" />,           label: "Bug" },
  question:               { pill: "bg-violet-500 text-white border-violet-600",     dropdownIcon: "bg-violet-100 text-violet-600 border-violet-200", icon: <HelpCircle className="w-3 h-3" />,    label: "Question" },
  feature:                { pill: "bg-cyan-500 text-white border-cyan-600",         dropdownIcon: "bg-cyan-100 text-cyan-600 border-cyan-200",       icon: <Sparkles className="w-3 h-3" />,      label: "Feature" },
  other:                  { pill: "bg-slate-500 text-white border-slate-600",       dropdownIcon: "bg-slate-100 text-slate-600 border-slate-200",    icon: <MoreHorizontal className="w-3 h-3" />, label: "Other" },
  "General Inquiry":      { pill: "bg-slate-600 text-white border-slate-700",       dropdownIcon: "bg-slate-100 text-slate-600 border-slate-200",    icon: <MessageSquare className="w-3 h-3" />, label: "General Inquiry" },
  "Savings & Pricing":    { pill: "bg-emerald-600 text-white border-emerald-700",   dropdownIcon: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: <Tag className="w-3 h-3" />,         label: "Savings & Pricing" },
  "Gift Wallet & Rewards":{ pill: "bg-pink-500 text-white border-pink-600",         dropdownIcon: "bg-pink-100 text-pink-600 border-pink-200",       icon: <Sparkles className="w-3 h-3" />,      label: "Gift Wallet & Rewards" },
  "Technical Support":    { pill: "bg-orange-500 text-white border-orange-600",     dropdownIcon: "bg-orange-100 text-orange-600 border-orange-200", icon: <Wrench className="w-3 h-3" />,        label: "Technical Support" },
  Partnership:            { pill: "bg-indigo-500 text-white border-indigo-600",     dropdownIcon: "bg-indigo-100 text-indigo-600 border-indigo-200", icon: <Handshake className="w-3 h-3" />,     label: "Partnership" },
  Other:                  { pill: "bg-slate-500 text-white border-slate-600",       dropdownIcon: "bg-slate-100 text-slate-600 border-slate-200",    icon: <MoreHorizontal className="w-3 h-3" />, label: "Other" },
};

const STAGE_META = {
  new:      { label: "New",         icon: <AlertCircle className="w-3 h-3" />,  pill: "bg-amber-500 text-white border-amber-600",     bar: "bg-amber-400" },
  accepted: { label: "In Progress", icon: <Clock className="w-3 h-3" />,        pill: "bg-sky-500 text-white border-sky-600",         bar: "bg-primary" },
  resolved: { label: "Resolved",    icon: <CheckCircle2 className="w-3 h-3" />, pill: "bg-emerald-600 text-white border-emerald-700", bar: "bg-emerald-500" },
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function getStage(item: { accepted: boolean; resolved: boolean }): Stage {
  if (item.resolved) return "resolved";
  if (item.accepted) return "accepted";
  return "new";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days <  7) return `${days}d ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

// ─── Dropdown Filter ──────────────────────────────────────────────────────────

function FilterDropdown({
  options,
  active,
  onChange,
  placeholder,
}: {
  options: string[];
  active: string | null;
  onChange: (v: string | null) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeMeta = active ? CATEGORY_META[active] : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border text-sm font-medium transition-all duration-150",
          active
            ? cn("border", activeMeta?.dropdownIcon)
            : "bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
        )}
      >
        <Filter className="w-3.5 h-3.5 shrink-0" />
        {activeMeta ? (
          <span className="flex items-center gap-1.5">
            {activeMeta.icon}
            <span>{activeMeta.label}</span>
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 ml-0.5 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[180px] rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              active === null ? "text-foreground font-semibold bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            All types
            {active === null && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
          </button>
          <div className="my-1 border-t border-border" />
          {options.map((opt) => {
            const meta = CATEGORY_META[opt];
            const isActive = active === opt;
            return (
              <button
                key={opt}
                onClick={() => { onChange(isActive ? null : opt); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  isActive ? "text-foreground font-semibold bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded-md border text-[11px]", meta?.dropdownIcon)}>
                  {meta?.icon}
                </span>
                {meta?.label ?? opt}
                {isActive && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stage Badge ──────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  const m = STAGE_META[stage];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", m.pill)}>
      {stage === "new" ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> : m.icon}
      {m.label}
    </span>
  );
}

// ─── Row Skeleton ─────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <tr className="border-b border-border">
      {[40, 32, 56, 20, 16].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 w-${w} rounded-md bg-muted animate-pulse`} />
        </td>
      ))}
    </tr>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function HelpRow({ item, onAccept, onResolve }: {
  item: HelpItem;
  onAccept: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const stage = getStage(item);
  const cat = CATEGORY_META[item.category] ?? CATEGORY_META.other;

  return (
    <tr className={cn("border-b border-border transition-colors hover:bg-muted/30", pending && "opacity-50")}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{item.email}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{item.subject}</p>
      </td>
      <td className="px-5 py-4">
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cat.pill)}>
          {cat.icon}{cat.label}
        </span>
      </td>
      <td className="px-5 py-4">
        <StageBadge stage={stage} />
      </td>
      <td className="px-5 py-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-5 py-4">
        {stage === "new" && (
          <button
            onClick={() => startTransition(async () => { onAccept(item._id); await acceptRequest(item._id, "help"); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Accept
          </button>
        )}
        {stage === "accepted" && (
          <button
            onClick={() => startTransition(async () => { onResolve(item._id); await resolveRequest(item._id, "help"); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Resolve
          </button>
        )}
      </td>
    </tr>
  );
}

function ContactRow({ item, onAccept, onResolve }: {
  item: ContactItem;
  onAccept: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const stage = getStage(item);
  const cat = CATEGORY_META[item.topic] ?? CATEGORY_META.Other;

  return (
    <tr className={cn("border-b border-border transition-colors hover:bg-muted/30", pending && "opacity-50")}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{item.name}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-muted-foreground">{item.email}</span>
          {item.phone && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                <Phone className="w-2.5 h-2.5" />{item.phone}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cat.pill)}>
          {cat.icon}{cat.label}
        </span>
      </td>
      <td className="px-5 py-4">
        <StageBadge stage={stage} />
      </td>
      <td className="px-5 py-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-5 py-4">
        {stage === "new" && (
          <button
            onClick={() => startTransition(async () => { onAccept(item._id); await acceptRequest(item._id, "contact"); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Accept
          </button>
        )}
        {stage === "accepted" && (
          <button
            onClick={() => startTransition(async () => { onResolve(item._id); await resolveRequest(item._id, "contact"); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Resolve
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Expandable Message Row ───────────────────────────────────────────────────

function HelpRowExpanded({ item, onAccept, onResolve }: {
  item: HelpItem;
  onAccept: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const stage = getStage(item);
  const cat = CATEGORY_META[item.category] ?? CATEGORY_META.other;

  return (
    <>
      <tr
        className={cn("border-b border-border transition-colors cursor-pointer", expanded ? "bg-muted/30" : "hover:bg-muted/20", pending && "opacity-50")}
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 shrink-0", expanded && "rotate-90")} />
            <div>
              <span className="text-sm font-medium text-foreground truncate max-w-[200px] block">{item.email}</span>
              <span className="text-xs text-muted-foreground">{item.subject}</span>
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cat.pill)}>
            {cat.icon}{cat.label}
          </span>
        </td>
        <td className="px-5 py-3.5"><StageBadge stage={stage} /></td>
        <td className="px-5 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{formatDate(item.createdAt)}</td>
        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
          {stage === "new" && (
            <button onClick={() => startTransition(async () => { onAccept(item._id); await acceptRequest(item._id, "help"); })}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40">
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}Accept
            </button>
          )}
          {stage === "accepted" && (
            <button onClick={() => startTransition(async () => { onResolve(item._id); await resolveRequest(item._id, "help"); })}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:opacity-90 transition-all disabled:opacity-40">
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}Resolve
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20 border-b border-border">
          <td colSpan={5} className="px-5 py-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{item.message}</p>
          </td>
        </tr>
      )}
    </>
  );
}

function ContactRowExpanded({ item, onAccept, onResolve }: {
  item: ContactItem;
  onAccept: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const stage = getStage(item);
  const cat = CATEGORY_META[item.topic] ?? CATEGORY_META.Other;

  return (
    <>
      <tr
        className={cn("border-b border-border transition-colors cursor-pointer", expanded ? "bg-muted/30" : "hover:bg-muted/20", pending && "opacity-50")}
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 shrink-0", expanded && "rotate-90")} />
            <div>
              <span className="text-sm font-medium text-foreground block">{item.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{item.email}</span>
                {item.phone && <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Phone className="w-2.5 h-2.5" />{item.phone}</span>
                </>}
              </div>
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cat.pill)}>
            {cat.icon}{cat.label}
          </span>
        </td>
        <td className="px-5 py-3.5"><StageBadge stage={stage} /></td>
        <td className="px-5 py-3.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{formatDate(item.createdAt)}</td>
        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
          {stage === "new" && (
            <button onClick={() => startTransition(async () => { onAccept(item._id); await acceptRequest(item._id, "contact"); })}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40">
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}Accept
            </button>
          )}
          {stage === "accepted" && (
            <button onClick={() => startTransition(async () => { onResolve(item._id); await resolveRequest(item._id, "contact"); })}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:opacity-90 transition-all disabled:opacity-40">
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}Resolve
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20 border-b border-border">
          <td colSpan={5} className="px-5 py-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{item.message}</p>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function RequestsPanel({
  initialHelp,
  initialContact,
}: {
  initialHelp: HelpItem[];
  initialContact: ContactItem[];
}) {
  const [tab, setTab] = useState<Tab>("contact");
  const [view, setView] = useState<View>("ongoing");
  const [filter, setFilter] = useState<string | null>(null);
  const [helpItems, setHelpItems]       = useState<HelpItem[]>(initialHelp);
  const [contactItems, setContactItems] = useState<ContactItem[]>(initialContact);

  const helpAccept    = useCallback((id: string) => setHelpItems(p => p.map(i => i._id === id ? { ...i, accepted: true } : i)), []);
  const helpResolve   = useCallback((id: string) => setHelpItems(p => p.map(i => i._id === id ? { ...i, accepted: true, resolved: true } : i)), []);
  const contactAccept = useCallback((id: string) => setContactItems(p => p.map(i => i._id === id ? { ...i, accepted: true } : i)), []);
  const contactResolve= useCallback((id: string) => setContactItems(p => p.map(i => i._id === id ? { ...i, accepted: true, resolved: true } : i)), []);

  const count = (arr: (HelpItem | ContactItem)[], stage: Stage) => arr.filter(i => getStage(i) === stage).length;

  const hs = { new: count(helpItems, "new"), inProgress: count(helpItems, "accepted"), resolved: count(helpItems, "resolved") };
  const cs = { new: count(contactItems, "new"), inProgress: count(contactItems, "accepted"), resolved: count(contactItems, "resolved") };
  const activeStats = tab === "help" ? hs : cs;

  const filterOptions = tab === "help" ? (HELP_CATEGORIES as string[]) : (CONTACT_TOPICS as string[]);

  const filtered = <T extends HelpItem | ContactItem>(items: T[]): T[] =>
    items
      .filter(i => {
        const stage = getStage(i);
        const inView = view === "ongoing" ? stage !== "resolved" : stage === "resolved";
        const catMatch = filter === null || ("category" in i ? i.category === filter : i.topic === filter);
        return inView && catMatch;
      })
      .sort((a, b) => view === "resolved" ? 0 : ({ new: 0, accepted: 1, resolved: 2 }[getStage(a)] - { new: 0, accepted: 1, resolved: 2 }[getStage(b)]));

  const helpFiltered    = filtered(helpItems);
  const contactFiltered = filtered(contactItems);
  const rows            = tab === "help" ? helpFiltered.length : contactFiltered.length;
  const totalNew        = hs.new + cs.new;

  const SUMMARY_CARDS = [
    { label: "New",         value: activeStats.new,        iconCls: "bg-amber-100 text-amber-600",   border: "border-l-amber-400",   icon: <AlertCircle className="w-4 h-4" /> },
    { label: "In Progress", value: activeStats.inProgress, iconCls: "bg-sky-100 text-sky-600",       border: "border-l-sky-400",     icon: <Clock className="w-4 h-4" /> },
    { label: "Resolved",    value: activeStats.resolved,   iconCls: "bg-emerald-100 text-emerald-600", border: "border-l-emerald-500", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Support Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage contact and help form submissions from users and businesses.
          </p>
        </div>
        {totalNew > 0 && (
          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{totalNew} unread
          </span>
        )}
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {SUMMARY_CARDS.map(c => (
          <div key={c.label} className={cn("rounded-2xl border border-border bg-card shadow-sm p-4 border-l-4", c.border)}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</p>
              <div className={cn("p-1.5 rounded-lg", c.iconCls)}>{c.icon}</div>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">

        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Inbox className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Requests</h2>
              <p className="text-xs text-muted-foreground">Click a row to read the full message</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">{rows}</span>
          </div>

          {/* Source tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/60 border border-border">
            {([
              { key: "contact" as Tab, label: "Contact", icon: <MailCheck className="w-3.5 h-3.5" />, ct: cs.new },
              { key: "help" as Tab,    label: "Help Reports", icon: <HelpCircle className="w-3.5 h-3.5" />, ct: hs.new },
            ]).map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setFilter(null); }}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[10px] transition-all duration-150",
                  tab === t.key ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                )}>
                {t.icon}{t.label}
                {t.ct > 0 && (
                  <span className={cn("text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    tab === t.key ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" : "bg-muted text-muted-foreground"
                  )}>{t.ct}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/20">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/80 border border-border">
            {(["ongoing", "resolved"] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all duration-150 capitalize",
                  view === v ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                )}>{v === "ongoing" ? "Ongoing" : "Resolved"}</button>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Category dropdown */}
          <FilterDropdown
            options={filterOptions}
            active={filter}
            onChange={setFilter}
            placeholder="Filter by type"
          />

          {filter && (
            <button onClick={() => setFilter(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitter</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tab === "help"
                ? helpFiltered.map(item => (
                    <HelpRowExpanded key={item._id} item={item} onAccept={helpAccept} onResolve={helpResolve} />
                  ))
                : contactFiltered.map(item => (
                    <ContactRowExpanded key={item._id} item={item} onAccept={contactAccept} onResolve={contactResolve} />
                  ))
              }
              {rows === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        {view === "resolved" ? <CheckCircle2 className="w-5 h-5 text-muted-foreground" /> : <Inbox className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {view === "resolved" ? "No resolved requests" : "No active requests"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {view === "resolved" ? "Resolved items appear here once marked done." : "New submissions will show up here."}
                      </p>
                      {filter && (
                        <button onClick={() => setFilter(null)}
                          className="text-xs text-primary underline underline-offset-2 mt-1">
                          Clear filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}