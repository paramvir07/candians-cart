"use client";

import Logo from "../shared/Logo";

const FOOTER_LINKS = {
  // Shop: [
  //   { label: "All Groceries",    href: "#" },
  //   { label: "Fresh Produce",    href: "#" },
  //   { label: "Staples & Grains", href: "#" },
  //   { label: "Dairy & Eggs",     href: "#" },
  //   { label: "Spices & Pastes",  href: "#" },
  //   { label: "Weekly Deals",     href: "#" },
  // ],
  Company: [
    { label: "About Us",    href: "/about-us" },
    { label: "How It Works",href: "#howitworks" },
  ],
  Support: [
    { label: "Returns Policy",  href: "/returns" },
    { label: "Contact Us",      href: "/contact-us" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy",    href: "/cookies" },
  ],
};

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.203a.75.75 0 0 0 .916.916l5.356-1.474A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.593-.504-5.087-1.382l-.364-.217-3.773 1.038 1.04-3.774-.217-.364A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .footer-root {
          font-family: 'Sora', 'DM Sans', sans-serif;
          background: #1c1917;
          color: #e7e5e4;
        }

        /* ── Newsletter band ── */
        .footer-nl {
          background: linear-gradient(135deg, #166534 0%, #15803d 100%);
          padding: 48px 24px;
        }
        .footer-nl-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .footer-nl h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 4px;
        }
        .footer-nl p {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.75);
          margin: 0;
        }
        .footer-nl-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .footer-nl-form input {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-size: 13.5px;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          width: 240px;
          transition: border-color 0.2s, background 0.2s;
        }
        .footer-nl-form input::placeholder { color: rgba(255,255,255,0.55); }
        .footer-nl-form input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.18); }
        .footer-nl-form button {
          padding: 10px 20px;
          border-radius: 10px;
          background: #fff;
          color: #166534;
          font-weight: 800;
          font-size: 13.5px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .footer-nl-form button:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }

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

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .footer-logo-mark {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }
        .footer-logo-text {
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          letter-spacing: -0.4px;
        }
        .footer-logo-text span { color: #4ade80; }

        /* Store info */
        .footer-store-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-store-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          color: #a8a29e;
        }
        .footer-store-row strong { color: #e7e5e4; display: block; margin-bottom: 1px; }

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
        .footer-col ul li a {
          font-size: 13px;
          font-weight: 500;
          color: #a8a29e;
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-col ul li a:hover { color: #4ade80; }

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
        .footer-badges {
          display: flex;
          align-items: center;
          gap: 10px;
        }
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
          .footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 36px 24px;
          }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .footer-main { grid-template-columns: 1fr 1fr; }
          .footer-nl-inner { flex-direction: column; align-items: flex-start; }
          .footer-nl-form { width: 100%; }
          .footer-nl-form input { width: 100%; flex: 1; }
          .footer-bottom-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="footer-root">

        {/* ── Newsletter band ── */}
        {/* <div className="footer-nl">
          <div className="footer-nl-inner">
            <div>
              <h3>🛒 Get weekly deal alerts</h3>
              <p>Be first to know when new subsidised products drop. No spam, ever.</p>
            </div>
            <form className="footer-nl-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@example.com" />
              <button type="submit">Subscribe →</button>
            </form>
          </div>
        </div> */}

        {/* ── Main grid ── */}
        <div className="footer-main">

          {/* Brand col */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              {/* <div className="footer-logo-mark">CC</div>
              <span className="footer-logo-text">Canadian<span>'s</span>Cart</span> */}
              <Logo variant="full" />
            </a>
            <p>Subsidised grocery pickup for Canadian families in Abbotsford, BC. Save up to 30% on everyday essentials.</p>

            {/* <div className="footer-store-info">
              <div className="footer-store-row">
                <span>📍</span>
                <div>
                  <strong>Office</strong>
                  123 Fraser Valley Way, Abbotsford, BC V2S 0A1
                </div>
              </div>
              <div className="footer-store-row">
                <span>🕐</span>
                <div>
                  <strong>Pickup Hours</strong>
                  Mon–Sat 9 am – 7 pm · Sun 10 am – 5 pm
                </div>
              </div>
              <div className="footer-store-row">
                <span>📞</span>
                <div>
                  <strong>Phone</strong>
                  (604) 555-0192
                </div>
              </div>
            </div> */}

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
                {links.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>© {currentYear} Canadian's Cart Inc. All rights reserved.</p>
            <div className="footer-badges">
              <span className="footer-badge">🇨🇦 Made in Canada</span>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}