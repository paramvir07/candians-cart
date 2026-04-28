"use client";

import Logo from "../shared/Logo";
import { useRouter, usePathname } from "next/navigation";

const FOOTER_LINKS: Record<
  string,
  { label: string; href: string; scrollTo?: string; scrollPage?: string }[]
> = {
  Company: [
    { label: "About Us", href: "/about" },
    {
      label: "How It Works",
      href: "/#how-it-works",
      scrollTo: "how-it-works",
      scrollPage: "/",
    },
    {
      label: "Values",
      href: "/about#values",
      scrollTo: "values",
      scrollPage: "/about",
    },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/#faq", scrollTo: "faq", scrollPage: "/" },
    { label: "Terms and conditions", href: "/terms-and-conditions" },
  ],
  Tools: [
    {
      label: "Calculator",
      href: "/#calculator",
      scrollTo: "calculator",
      scrollPage: "/",
    },
  ],
};

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/candianscart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router   = useRouter();
  const pathname = usePathname();

  const handleSectionClick = (
    e: React.MouseEvent,
    sectionId: string,
    scrollPage: string = "/"
  ) => {
    e.preventDefault();
    if (pathname === scrollPage) {
      // Already on the right page — just scroll
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Navigate to the correct page and pass the section to scroll to
      router.push(`${scrollPage}?scrollTo=${sectionId}`);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .footer-root {
          font-family: 'Sora', 'DM Sans', sans-serif;
          background: #1c1917;
          color: #e7e5e4;
        }

        /* ── Main grid ── */
        .footer-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px 40px;
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 40px 32px;
        }

        .footer-brand p {
          font-size: 13px;
          color: #a8a29e;
          line-height: 1.7;
          margin: 12px 0 20px;
          max-width: 240px;
        }

        /* Social */
        .footer-social {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }
        .footer-social a {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a8a29e;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .footer-social a:hover { background: #16a34a; color: #fff; transform: translateY(-2px); }

        /* Link columns */
        .footer-col h4 {
          font-size: 11px;
          font-weight: 700;
          color: #78716c;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 14px;
        }
        .footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .footer-col ul li a,
        .footer-col ul li button {
          font-size: 13px;
          font-weight: 500;
          color: #a8a29e;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s;
        }
        .footer-col ul li a:hover,
        .footer-col ul li button:hover { color: #4ade80; }

        /* ── Bottom bar ── */
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 20px 24px;
        }
        .footer-bottom-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .footer-bottom p {
          font-size: 12px;
          color: #78716c;
          margin: 0;
        }
        .footer-badges { display: flex; align-items: center; gap: 10px; }
        .footer-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: #a8a29e;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .footer-main { grid-template-columns: 1fr 1fr; gap: 36px 24px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .footer-main { grid-template-columns: 1fr 1fr; }
          .footer-bottom-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="footer-root">

        {/* ── Main grid ── */}
        <div className="footer-main">

          {/* Brand col */}
          <div className="footer-brand">
            <Logo variant="full" href="/" />
            <p>Subsidised grocery pickup for Canadian families in Abbotsford, BC. Save up to 30% on everyday essentials.</p>
            <div className="footer-social">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="footer-col">
              <h4>{title}</h4>
              <ul>
                {links.map((l) =>
                  l.scrollTo ? (
                    <li key={l.label}>
                      <button onClick={(e) => handleSectionClick(e, l.scrollTo!, l.scrollPage)}>
                        {l.label}
                      </button>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>© {currentYear} Candian's Cart Inc. All rights reserved.</p>
            <div className="footer-badges">
              <span className="footer-badge">🇨🇦 Made in Canada</span>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}