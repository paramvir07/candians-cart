"use client";

import { useEffect, useState, useRef } from "react";
import Logo from "../shared/Logo";

const NAV_LINKS = [
  {
    label: "Shop",
    children: [
      { label: "All Groceries",    href: "#" },
      { label: "Fresh Produce",    href: "#" },
      { label: "Staples & Grains", href: "#" },
      { label: "Dairy & Eggs",     href: "#" },
      { label: "Spices & Pastes",  href: "#" },
    ],
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "About",
    children: [
      { label: "Our Story",  href: "#" },
      { label: "Community",  href: "#" },
      { label: "Blog",       href: "#" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Root ── */
        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Sora', sans-serif;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .nav-root.scrolled {
          background: rgba(254,245,228,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(68,25,6,0.08), 0 4px 24px rgba(68,25,6,0.07);
        }
        .nav-root:not(.scrolled) { background: transparent; }

        /* ── Inner bar ── */
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: 28px;
        }

        /* ── Desktop links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }

        /* KEY FIX: use a real anchor/button as the trigger.
           The dropdown appears on :hover of the wrapper but the
           pointer-events gap between button and panel was causing
           the hover to drop — we bridge it with a pseudo-element. */
        .nav-item {
          position: relative;
        }

        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 7px 13px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          color: #44403c;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          text-decoration: none;
          font-family: inherit;
          line-height: 1;
        }
        .nav-btn:hover,
        .nav-item:hover > .nav-btn {
          background: rgba(22,101,52,0.08);
          color: #166534;
        }

        .nav-btn .chevron {
          width: 12px;
          height: 12px;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .nav-item:hover > .nav-btn .chevron { transform: rotate(180deg); }

        /* Bridge gap so moving mouse from button to dropdown doesn't lose hover */
        .nav-item::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          height: 10px;
        }

        /* ── Dropdown panel ── */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 200px;
          background: #fff;
          border: 1px solid rgba(68,25,6,0.10);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 8px 32px rgba(68,25,6,0.12);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 200;
        }
        .nav-item:hover > .nav-dropdown {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .nav-dropdown a {
          display: block;
          padding: 9px 13px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #44403c;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap;
        }
        .nav-dropdown a:hover { background: #f0fdf4; color: #166534; }

        /* ── Right side ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .nav-location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #78716c;
          background: rgba(68,25,6,0.05);
          border-radius: 20px;
          padding: 5px 11px;
          white-space: nowrap;
          margin-right: 4px;
        }

        .btn-ghost {
          padding: 7px 16px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 700;
          color: #44403c;
          background: none;
          border: 1.5px solid rgba(68,25,6,0.15);
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .btn-ghost:hover {
          background: rgba(22,101,52,0.07);
          color: #166534;
          border-color: rgba(22,101,52,0.25);
        }

        .btn-primary {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(180deg,#22c55e 0%,#16a34a 100%);
          border: 1px solid rgba(0,0,0,0.08);
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 3px 10px rgba(22,101,52,.25);
          transition: box-shadow 0.15s, transform 0.15s;
          font-family: inherit;
        }
        .btn-primary:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,.1), 0 6px 18px rgba(22,101,52,.35);
          transform: translateY(-1px);
        }

        /* ── Hamburger (hidden on desktop) ── */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
          border: none;
          background: none;
          border-radius: 8px;
          flex-shrink: 0;
          /* LEFT side — comes before logo in mobile layout */
          order: -1;
          margin-right: 10px;
          transition: background 0.15s;
        }
        .nav-hamburger:hover { background: rgba(68,25,6,0.06); }
        .nav-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #44403c;
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s, width 0.25s;
          transform-origin: center;
        }
        .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile overlay backdrop ── */
        .mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.25);
          z-index: 98;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }
        .mobile-backdrop.open { display: block; }

        /* ── Mobile drawer ── */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          z-index: 99;
          background: #fff;
          border-top: 1px solid rgba(68,25,6,0.08);
          border-bottom: 1px solid rgba(68,25,6,0.08);
          box-shadow: 0 12px 40px rgba(68,25,6,0.14);
          overflow-y: auto;
          max-height: calc(100vh - 64px);
          animation: slideDown 0.22s ease;
        }
        .mobile-menu.open { display: block; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-inner { padding: 8px 16px 24px; }

        .mobile-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 10px;
          font-size: 14px;
          font-weight: 600;
          color: #1c1917;
          text-decoration: none;
          border-bottom: 1px solid rgba(68,25,6,0.06);
          cursor: pointer;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          border-radius: 0;
          transition: color 0.12s;
        }
        .mobile-link:last-of-type { border-bottom: none; }
        .mobile-link:hover { color: #166534; }

        .mobile-chevron {
          width: 14px;
          height: 14px;
          color: #78716c;
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }
        .mobile-chevron.open { transform: rotate(180deg); }

        .mobile-sub {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.28s ease;
          background: #fafaf9;
          border-radius: 10px;
          margin: 0 2px 4px;
        }
        .mobile-sub.open { max-height: 400px; }

        .mobile-sub a {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13.5px;
          font-weight: 500;
          color: #57534e;
          text-decoration: none;
          border-bottom: 1px solid rgba(68,25,6,0.05);
          transition: color 0.12s, background 0.12s;
        }
        .mobile-sub a:last-child { border-bottom: none; }
        .mobile-sub a::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d4d0ca;
          flex-shrink: 0;
        }
        .mobile-sub a:hover { color: #166534; background: #f0fdf4; }
        .mobile-sub a:hover::before { background: #16a34a; }

        .mobile-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #78716c;
          padding: 12px 10px 6px;
        }

        .mobile-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
          padding: 0 2px;
        }
        .mobile-btns button {
          padding: 12px;
          font-size: 14px;
          border-radius: 11px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          border: none;
          transition: opacity 0.15s, transform 0.15s;
        }
        .mobile-btns button:active { transform: scale(0.97); }
        .mobile-btn-ghost {
          background: #f5f4f2;
          color: #44403c;
          border: 1.5px solid rgba(68,25,6,0.12) !important;
        }
        .mobile-btn-primary {
          background: linear-gradient(180deg,#22c55e 0%,#16a34a 100%);
          color: #fff;
          border: 1px solid rgba(0,0,0,.08) !important;
          box-shadow: 0 3px 10px rgba(22,101,52,.3);
        }

        /* ── Responsive breakpoint ── */
        @media (max-width: 820px) {
          .nav-links,
          .nav-right,
          .nav-location { display: none; }
          .nav-hamburger { display: flex; }

          /* Keep logo centered between hamburger and right edge hint */
          .nav-inner { padding: 0 16px; }
        }
      `}</style>

      {/* Backdrop (mobile only) */}
      <div
        className={`mobile-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <nav className={`nav-root${scrolled ? " scrolled" : ""}`} ref={menuRef}>
        <div className="nav-inner">

          {/* Hamburger — order:-1 puts it left of logo in flex flow */}
          <button
            className={`nav-hamburger${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>

          {/* Logo */}
          <a href="/" className="nav-logo">
            <Logo variant="full" />
          </a>

          {/* Desktop links */}
          <div className="nav-links">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="nav-item">
                  <button className="nav-btn" type="button">
                    {link.label}
                    <svg className="chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="nav-dropdown">
                    {link.children.map((c) => (
                      <a key={c.label} href={c.href}>{c.label}</a>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={link.label} className="nav-item">
                  <a href={link.href} className="nav-btn">{link.label}</a>
                </div>
              )
            )}
          </div>

          {/* Location pill */}
          <div className="nav-location">
            📍 Abbotsford, BC
          </div>

          {/* Desktop CTAs */}
          <div className="nav-right">
            <button className="btn-ghost">Login</button>
            <button className="btn-primary">Register Free</button>
          </div>
        </div>

        {/* Mobile drawer — fixed, does NOT push content */}
        <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
          <div className="mobile-inner">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="mobile-link"
                    onClick={() =>
                      setOpenDropdown(openDropdown === link.label ? null : link.label)
                    }
                  >
                    {link.label}
                    <svg
                      className={`mobile-chevron${openDropdown === link.label ? " open" : ""}`}
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className={`mobile-sub${openDropdown === link.label ? " open" : ""}`}>
                    {link.children.map((c) => (
                      <a key={c.label} href={c.href}>{c.label}</a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={link.label} href={link.href} className="mobile-link">
                  {link.label}
                </a>
              )
            )}

            <div className="mobile-location">📍 Abbotsford, BC</div>

            <div className="mobile-btns">
              <button className="mobile-btn-ghost">Login</button>
              <button className="mobile-btn-primary">Register Free</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}