"use client";

import { useState } from "react";
import {
  UserPlus,
  Wallet,
  Store,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Coins,
  PackageCheck,
  ShoppingCart,
  BadgePercent,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";

type FAQItem = {
  id: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
  tag?: string;
};

const faqItems: FAQItem[] = [
  {
    id: "item-1",
    icon: <PiggyBank size={16} strokeWidth={1.75} />,
    question: "How do I save money with this app?",
    answer:
      "You save money by using subsidies on subsidized items. When your order has at least C$21 of regular items before tax, the app shows subsidies you can use. The more money you spend on regular items, the more subsidies you can receive. You can use those subsidies right away on subsidized items in the same order, or save them in your Gift Wallet for later. When you use subsidies, your total becomes lower and you pay less at the store.",
    tag: "Savings",
  },
  {
    id: "item-2",
    icon: <Wallet size={16} strokeWidth={1.75} />,
    question: "How do I earn subsidies?",
    answer:
      "You earn subsidies when your order has at least C$21 of regular items before tax. Regular items are items that are not subsidized. Once your order reaches C$21 before tax, the app shows the subsidies you can receive. If you spend more on regular items, your subsidies can also increase.",
    tag: "Rewards",
  },
  {
    id: "item-3",
    icon: <Coins size={16} strokeWidth={1.75} />,
    question: "What are subsidies?",
    answer:
      "Subsidies are like reward money in the app. They help you pay less for subsidized items. You receive subsidies based on how much you spend on regular items. You can use subsidies right away when they are shown in your order, or keep them saved in your Gift Wallet for a future order.",
    tag: "Subsidies",
  },
  {
    id: "item-4",
    icon: <BadgePercent size={16} strokeWidth={1.75} />,
    question: "Which items can I use subsidies on?",
    answer:
      "Subsidies can be used only on subsidized items. These are special items where you can pay less using subsidies. Subsidized items may include milk, vegetables, fruits, and selected daily grocery items.",
    tag: "Savings",
  },
  {
    id: "item-5",
    icon: <Store size={16} strokeWidth={1.75} />,
    question: "Where can I use my subsidies?",
    answer:
      "You can use your subsidies at your selected store on subsidized items only. Subsidies do not work on every item. They only work on items that are marked as subsidized.",
    tag: "Subsidies",
  },
  {
    id: "item-6",
    icon: <ShoppingCart size={16} strokeWidth={1.75} />,
    question: "Can I order from the app or shop in store?",
    answer:
      "Yes. You can shop in two ways. You can add items to your cart in the app and tap Pay at Store to place your order. You can also go directly to your selected store and shop like regular grocery shopping. At checkout, the cashier can scan your ID and place the order for you.",
    tag: "Orders",
  },
  {
    id: "item-7",
    icon: <PackageCheck size={16} strokeWidth={1.75} />,
    question: "How do I place an order from the app?",
    answer:
      "Choose the items you want and add them to your cart. At checkout, the app shows any subsidies you can use on subsidized items. If you use subsidies, your price becomes lower. If you do not use your subsidies, they will stay saved in your Gift Wallet for later. Then tap Pay at Store and pay when you visit the store.",
    tag: "Orders",
  },
  {
    id: "item-8",
    icon: <Store size={16} strokeWidth={1.75} />,
    question: "Can I shop directly at the store?",
    answer:
      "Yes. You can go directly to your selected store and shop like you normally do for groceries. At checkout, the cashier can scan your ID and place the order for you. If you have subsidies in your Gift Wallet, they can be used on subsidized items.",
    tag: "Store",
  },
  {
    id: "item-9",
    icon: <PiggyBank size={16} strokeWidth={1.75} />,
    question: "What happens if I do not use my subsidies?",
    answer:
      "Your subsidies do not disappear. If you do not use them, they stay safely saved in your Gift Wallet. You can use them later on future orders when you buy subsidized items.",
    tag: "Gift Wallet",
  },
  {
    id: "item-10",
    icon: <UserPlus size={16} strokeWidth={1.75} />,
    question: "How do I create an account?",
    answer:
      "Tap Sign Up and choose your city. Then select the store you want to shop from, enter your details, and add your referral code if you have one. After you verify your email, your account will be ready. Please choose your store carefully because it cannot be changed later.",
    tag: "Account",
  },
];

export default function FAQsSection() {
  const [openId, setOpenId] = useState<string | null>("item-1");

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      id="faq"
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #fef5e4 0%, #fff 100%)",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        /* dot grid bg */
        .faq-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #16a34a12 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* accordion item */
        .faq-item {
          background: #fff;
          border: 1px solid rgba(22,101,52,0.10);
          border-radius: 16px;
          overflow: hidden;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .faq-item:hover {
          border-color: rgba(22,101,52,0.22);
          box-shadow: 0 4px 20px rgba(22,101,52,0.07);
        }
        .faq-item.open {
          border-color: rgba(22,101,52,0.28);
          box-shadow: 0 4px 24px rgba(22,101,52,0.10);
        }

        /* trigger button */
        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 20px;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
        }

        /* chevron rotation */
        .faq-chevron {
          flex-shrink: 0;
          transition: transform 0.25s ease;
          color: #16a34a;
        }
        .faq-chevron.rotated { transform: rotate(180deg); }

        /* answer panel */
        .faq-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s ease;
        }
        .faq-body.open { grid-template-rows: 1fr; }
        .faq-body-inner { overflow: hidden; }

        /* tag pill */
        .faq-tag {
          display: inline-flex;
          align-items: center;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 99px;
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* icon badge */
        .faq-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border: 1px solid #86efac;
          flex-shrink: 0;
          color: #15803d;
        }

        /* section pill */
        .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        /* sticky left col */
        @media (min-width: 768px) {
          .faq-left { position: sticky; top: 100px; align-self: flex-start; }
        }

        /* contact card */
        .contact-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #166534, #16a34a);
          padding: 20px;
          margin-top: 24px;
        }
      `}</style>

      <div className="faq-section relative max-w-5xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* ── LEFT: sticky header ── */}
          <div className="faq-left md:w-80 flex-shrink-0">
            <div className="section-pill">
              <Sparkles size={13} />
              FAQ
            </div>
            <h2
              style={{
                fontWeight: 800,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: "#1c1917",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                marginBottom: 12,
              }}
            >
              Got questions?
              <br />
              <span style={{ color: "#16a34a" }}>We've got answers.</span>
            </h2>
            <p
              style={{ color: "#78716c", fontSize: "0.9rem", lineHeight: 1.7 }}
            >
              Everything you need to know about Candian's Cart and how it works
              for your family.
            </p>

            {/* Contact card */}
            <div className="contact-card">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <MessageCircle size={18} color="#fff" strokeWidth={1.5} />
              </div>
              <p
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "0.92rem",
                  marginBottom: 4,
                }}
              >
                Still have questions?
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                Our support team is happy to help you get started.
              </p>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  borderRadius: 10,
                  padding: "8px 16px",
                  textDecoration: "none",
                }}
              >
                Contact support <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: accordion ── */}
          <div className="flex-1 min-w-0 space-y-3">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                >
                  {/* Trigger */}
                  <button
                    className="faq-trigger"
                    onClick={() => toggle(item.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="faq-icon">{item.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {item.tag && (
                            <span className="faq-tag">{item.tag}</span>
                          )}
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "0.92rem",
                            color: "#1c1917",
                            lineHeight: 1.4,
                            display: "block",
                          }}
                        >
                          {item.question}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`faq-chevron ${isOpen ? "rotated" : ""}`}
                    />
                  </button>

                  {/* Answer panel — grid trick for smooth expand */}
                  <div className={`faq-body ${isOpen ? "open" : ""}`}>
                    <div className="faq-body-inner">
                      <div
                        style={{
                          padding: "0 20px 20px 20px",
                          paddingLeft:
                            "calc(20px + 32px + 12px)" /* align under question text */,
                        }}
                      >
                        <p
                          style={{
                            color: "#57534e",
                            fontSize: "0.88rem",
                            lineHeight: 1.75,
                          }}
                        >
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom CTA strip */}
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "14px 18px",
                marginTop: 8,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span style={{ fontSize: "1.3rem" }}>🇨🇦</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#166534" }}>
                  Exclusive to Canadian families in Abbotsford, BC
                </span>
              </div>
              <Link
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#166534",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  borderRadius: 10,
                  padding: "8px 16px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Join waitlist <ArrowRight size={13} />
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
