import Link from "next/link";
import { ArrowUpRight, Bell, Sparkles } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import FooterWrapper from "@/components/landing/FooterWrapper";

const socials = [
  {
    name: "Instagram",
    username: "@canadianscart",
    description:
      "Follow us for product highlights, behind-the-scenes updates, offers, and new feature announcements.",
    href: "https://www.instagram.com/canadianscart",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    bgGlow: "bg-pink-500/20",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    username: "@canadianscart",
    description:
      "Stay connected with our latest app news, community posts, feature launches, and important updates.",
    href: "https://www.facebook.com/canadianscart",
    gradient: "from-blue-600 via-blue-500 to-sky-400",
    bgGlow: "bg-blue-500/20",
    icon: FacebookIcon,
  },
  {
    name: "TikTok",
    username: "@canadianscart",
    description:
      "Watch quick updates, fun clips, app walkthroughs, and fresh announcements from our team.",
    href: "https://vt.tiktok.com/ZSxjaYrjL/",
    gradient: "from-neutral-950 via-zinc-800 to-cyan-500",
    bgGlow: "bg-cyan-500/20",
    icon: TikTokIcon,
  },
];

export default function SocialsPage() {
  return (
    <>
      <main className="relative min-h-screen overflow-x-hidden scroll-smooth bg-background text-foreground">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
        </div>

        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          {/* Header */}
          <header className="flex items-center justify-between">
            <Logo variant="icon" href="/" />

            <Link
              href="/customer"
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition hover:border-primary/40 hover:text-foreground"
            >
              Skip
            </Link>
          </header>

          {/* Hero */}
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-12 text-center sm:py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Get the latest from Candian&apos;s Cart
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Follow us for updates, new features, and fresh announcements.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              We share app improvements, new launches, offers, community
              updates, and helpful tips across our social channels.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#socials"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98]"
              >
                <Bell className="h-4 w-4" />
                View our socials
              </a>

              <Link
                href="https://www.instagram.com/canadianscart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/70 px-6 text-sm font-semibold shadow-sm backdrop-blur transition hover:border-primary/40 hover:text-primary active:scale-[0.98]"
              >
                Follow on Instagram
              </Link>
            </div>
          </div>
        </section>

        {/* Social Cards */}
        <section
          id="socials"
          className="mx-auto w-full max-w-7xl scroll-mt-10 px-5 pb-16 sm:px-8 lg:px-10"
        >
          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {socials.map((social) => {
              const Icon = social.icon;

              return (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  {/* Card glow */}
                  <div
                    className={cn(
                      "absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition duration-300 group-hover:scale-125",
                      social.bgGlow,
                    )}
                  />

                  <div className="relative z-10">
                    <div
                      className={cn(
                        "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition duration-300 group-hover:scale-105",
                        social.gradient,
                      )}
                    >
                      <Icon className="h-8 w-8" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          {social.name}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-primary">
                          {social.username}
                        </p>
                      </div>

                      <div className="rounded-full border border-border bg-background/70 p-2 text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-muted-foreground">
                      {social.description}
                    </p>

                    <div className="mt-6 inline-flex items-center text-sm font-semibold text-foreground transition group-hover:text-primary">
                      Visit {social.name}
                      <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <FooterWrapper />
    </>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.2 8.6V7.1c0-.7.5-.9 1-.9h2V3h-2.8c-3.1 0-4.1 2-4.1 4v1.6H7.8V12h2.5v9h3.9v-9h2.7l.5-3.4h-3.2Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 3c.3 2.4 1.7 3.9 4 4.1v3.4c-1.4.1-2.7-.3-4-1.1v5.7c0 3.6-2.2 5.9-5.7 5.9-3.2 0-5.5-2.1-5.5-5.1 0-3.2 2.5-5.4 6-5.2v3.5c-1.5-.2-2.4.5-2.4 1.7 0 1 .8 1.7 1.9 1.7 1.3 0 2-.8 2-2.5V3h3.7Z" />
    </svg>
  );
}
