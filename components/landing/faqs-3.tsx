"use client";

import { useState } from "react";
import {
  UserPlus,
  Mail,
  Percent,
  Wallet,
  Store,
  ShieldCheck,
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
    icon: <UserPlus size={16} strokeWidth={1.75} />,
    question: "How do I create an account?",
    answer:
      "Tap Sign Up, choose your city, and select your store. Then enter your details and referral code. After you verify your email, your account will be ready to use. Your selected store cannot be changed later.",
    tag: "Account",
  },
  {
    id: "item-2",
    icon: <BadgePercent size={16} strokeWidth={1.75} />,
    question: "Which items are subsidized",
    answer:
      "Milk, vegetables, fruits, and some daily grocery subsidized on which the credits can be used.",
    tag: "Savings",
  },
  {
    id: "item-3",
    icon: <ShoppingCart size={16} strokeWidth={1.75} />,
    question: "How does ordering work?",
    answer:
      "Add items to your cart and go to checkout. You can use your credits to lower the price, or save them for later. Then press Pay at Store to place the order.",
    tag: "Orders",
  },
  {
    id: "item-4",
    icon: <Coins size={16} strokeWidth={1.75} />,
    question: "What are credits?",
    answer:
      "Credits are reward money you earn from orders. You can use them to pay less for subsidized items.",
    tag: "Credits",
  },
  {
    id: "item-5",
    icon: <Wallet size={16} strokeWidth={1.75} />,
    question: "How do I earn credits?",
    answer:
      "Place an order with at least C$21 of regular items before tax. After the order is completed, credits will be added to your wallet automatically.",
    tag: "Rewards",
  },
  {
    id: "item-6",
    icon: <Store size={16} strokeWidth={1.75} />,
    question: "Where can I use my credits?",
    answer:
      "You can use your credits on subsidized items to reduce the total price.",
    tag: "Credits",
  },
  {
    id: "item-7",
    icon: <PackageCheck size={16} strokeWidth={1.75} />,
    question: "How do I place an order?",
    answer:
      "Choose the items you want, add them to your cart, and checkout. You can use your credits or save them for later. Then press Pay at Store.",
    tag: "Orders",
  },
  {
    id: "item-8",
    icon: <PiggyBank size={16} strokeWidth={1.75} />,
    question: "What happens if I don’t use my credits?",
    answer:
      "Your credits stay safely in your wallet and can be used on future orders.",
    tag: "Wallet",
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
