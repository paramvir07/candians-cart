import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface HelpFormEmailProps {
  userEmail: string
  category: "bug" | "question" | "feature" | "other"
  subject: string
  message: string
}

const categoryMeta: Record<
  HelpFormEmailProps["category"],
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string; rewardNote?: string }
> = {
  bug: {
    label: "Bug Report",
    emoji: "🐛",
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    rewardNote: "If this report identifies a valid bug, $10 will be credited to your Gift Wallet within 3 business days.",
  },
  question: { label: "Question", emoji: "❓", color: "#2563eb", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
  feature:  { label: "Feature Request", emoji: "✨", color: "#7c3aed", bgColor: "#f5f3ff", borderColor: "#ddd6fe" },
  other:    { label: "Other", emoji: "💬", color: "#059669", bgColor: "#f0fdf4", borderColor: "#a7f3d0" },
}

export default function HelpFormEmail({
  userEmail,
  category,
  subject,
  message,
}: HelpFormEmailProps) {
  const meta = categoryMeta[category]

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>We received your {meta.label} — we'll be in touch within 24 hours.</Preview>

        <Body style={{ backgroundColor: "#ecf0ec", margin: 0, padding: "40px 16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <Container style={{ maxWidth: "560px", margin: "0 auto" }}>

            {/* Card */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>

              {/* Top gradient accent bar */}
              <div style={{ background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)", height: "4px" }} />

              {/* Hero */}
              <div style={{ padding: "44px 44px 32px", textAlign: "center" }}>

                {/* Checkmark circle — table-based for email compatibility */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 24px" }}>
                  <tbody>
                    <tr>
                      <td style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: "26px",
                        fontWeight: "700",
                        color: "#16a34a",
                        lineHeight: "60px",
                      }}>
                        ✓
                      </td>
                    </tr>
                  </tbody>
                </table>

                <Heading style={{ fontSize: "25px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: "1.25" }}>
                  We&apos;ve got your message
                </Heading>
                <Text style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.75", margin: 0 }}>
                  Your <span style={{ fontWeight: "700", color: "#111827" }}>{meta.label}</span> has been received. We&apos;ll reply to{" "}
                  <span style={{ fontWeight: "700", color: "#16a34a" }}>{userEmail}</span> within 24 hours.
                </Text>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />

              {/* Submission details */}
              <div style={{ padding: "28px 44px" }}>
                <Text style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.13em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 14px" }}>
                  Submission details
                </Text>

                <table cellPadding={0} cellSpacing={0} style={{ marginBottom: "14px" }}>
                  <tbody>
                    <tr>
                      <td style={{
                        backgroundColor: meta.bgColor,
                        border: `1px solid ${meta.borderColor}`,
                        borderRadius: "999px",
                        padding: "4px 13px",
                      }}>
                        <Text style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: meta.color }}>
                          {meta.emoji} {meta.label}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <Text style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: "1.3" }}>
                  {subject}
                </Text>

                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #16a34a", borderRadius: "10px", padding: "16px 18px" }}>
                  <Text style={{ fontSize: "13px", color: "#475569", lineHeight: "1.8", margin: 0, whiteSpace: "pre-wrap" }}>
                    {message}
                  </Text>
                </div>
              </div>

              {/* Bug reward */}
              {category === "bug" && meta.rewardNote && (
                <>
                  <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />
                  <div style={{ padding: "22px 44px" }}>
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px 18px" }}>
                      <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ width: "32px", verticalAlign: "top", paddingRight: "12px", paddingTop: "2px", fontSize: "20px" }}>💰</td>
                            <td>
                              <Text style={{ fontSize: "13px", fontWeight: "700", color: "#15803d", margin: "0 0 3px" }}>$10 Gift Wallet Reward</Text>
                              <Text style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.6" }}>{meta.rewardNote}</Text>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* What's next */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />
              <div style={{ padding: "28px 44px 40px" }}>
                <Text style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.13em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 16px" }}>
                  What happens next
                </Text>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tbody>
                    {([
                      { n: "1", t: "Review", d: "Our team will review your submission carefully." },
                      { n: "2", t: "Response", d: "We'll reach out within 24 hours via email." },
                      { n: "3", t: "Resolution", d: "We'll work with you until fully resolved." },
                    ] as const).map((step, i) => (
                      <tr key={step.n}>
                        <td style={{ width: "28px", verticalAlign: "top", paddingRight: "14px", paddingBottom: i < 2 ? "14px" : "0" }}>
                          <table cellPadding={0} cellSpacing={0}>
                            <tbody>
                              <tr>
                                <td style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  backgroundColor: "#16a34a",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  color: "white",
                                  lineHeight: "24px",
                                }}>
                                  {step.n}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ paddingBottom: i < 2 ? "14px" : "0", verticalAlign: "top" }}>
                          <Text style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px" }}>{step.t}</Text>
                          <Text style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{step.d}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: "24px" }}>
              <Text style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 3px", lineHeight: "1.6" }}>
                Automated confirmation · Do not reply to this email
              </Text>
              <Text style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                © {new Date().getFullYear()} Candian Cart · Invite-only family grocery platform
              </Text>
            </div>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}