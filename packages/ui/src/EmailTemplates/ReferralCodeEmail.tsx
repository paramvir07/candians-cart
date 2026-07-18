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

interface ReferralCodeEmailProps {
  recipientName: string
  recipientEmail: string
  referralCode: string
}

export default function ReferralCodeEmail({
  recipientName,
  recipientEmail,
  referralCode,
}: ReferralCodeEmailProps) {

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>🎟️ Your Candian's Cart referral code is here — use it before it expires.</Preview>

        <Body style={{
          backgroundColor: "#ecf0ec",
          margin: 0,
          padding: "40px 16px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          <Container style={{ maxWidth: "560px", margin: "0 auto" }}>

            {/* Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}>

              {/* Top accent bar */}
              <div style={{ background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)", height: "4px" }} />

              {/* Hero */}
              <div style={{ padding: "44px 44px 32px", textAlign: "center" }}>

                {/* Ticket icon circle */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 24px" }}>
                  <tbody>
                    <tr>
                      <td style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        backgroundColor: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: "30px",
                        lineHeight: "64px",
                      }}>
                        🎟️
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Invite-only badge */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 18px" }}>
                  <tbody>
                    <tr>
                      <td style={{
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: "999px",
                        padding: "4px 14px",
                      }}>
                        <Text style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#16a34a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          ✦ Invite Only
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <Heading style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 12px",
                  letterSpacing: "-0.035em",
                  lineHeight: "1.2",
                }}>
                  You're in, {recipientName.split(" ")[0]}. 🥂
                </Heading>

                <Text style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.8", margin: 0 }}>
                  Your referral code for{" "}
                  <span style={{ fontWeight: "700", color: "#111827" }}>Candian's Cart</span>{" "}
                  is below. Pass it along to someone or use it yourself either way, it gets you in.
                </Text>
              </div>

              {/* Code block */}
              <div style={{ padding: "0 44px 32px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "1.5px solid #86efac",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  textAlign: "center",
                }}>
                  <Text style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#16a34a", margin: "0 0 10px" }}>
                    Your referral code
                  </Text>
                  <Text style={{
                    fontSize: "34px",
                    fontWeight: "800",
                    color: "#0f172a",
                    letterSpacing: "0.18em",
                    margin: "0 0 12px",
                    fontFamily: "monospace",
                  }}>
                    {referralCode}
                  </Text>
                </div>
              </div>

              {/* Urgency banner */}
              <div style={{ padding: "0 44px 32px" }}>
                <div style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fcd34d",
                  borderLeft: "4px solid #f59e0b",
                  borderRadius: "12px",
                  padding: "16px 18px",
                }}>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "28px", verticalAlign: "top", paddingRight: "12px", fontSize: "18px", paddingTop: "1px" }}>⏳</td>
                        <td>
                          <Text style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", margin: "0 0 3px" }}>
                            Limited window - don't sit on it
                          </Text>
                          <Text style={{ fontSize: "12px", color: "#a16207", margin: 0, lineHeight: "1.6" }}>
                            We're still early. Once we open up to a wider audience, referral codes go away. Use it while it works.
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />

              {/* What you unlock */}
              <div style={{ padding: "28px 44px" }}>
                <Text style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.13em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 16px" }}>
                  What you're getting
                </Text>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tbody>
                    {([
                      { emoji: "🛒", t: "Test it before everyone else", d: "We're not open to a larger audience yet — you get to kick the tires first." },
                      { emoji: "💰", t: "Real savings on groceries", d: "Actual discounts right at your first order." },
                    ] as const).map((item, i) => (
                      <tr key={item.t}>
                        <td style={{ width: "36px", verticalAlign: "top", paddingRight: "14px", paddingBottom: i < 1 ? "14px" : "0", fontSize: "20px" }}>
                          {item.emoji}
                        </td>
                        <td style={{ paddingBottom: i < 1 ? "14px" : "0", verticalAlign: "top" }}>
                          <Text style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px" }}>{item.t}</Text>
                          <Text style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{item.d}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />

              {/* Footer note */}
              <div style={{ padding: "24px 44px 40px", textAlign: "center" }}>
                <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", lineHeight: "1.7" }}>
                  This code was sent to{" "}
                  <span style={{ color: "#64748b", fontWeight: "600" }}>{recipientEmail}</span>{" "}
                  after a referral request on canadianscart.ca.
                </Text>
                <Text style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.7" }}>
                  Don't share this email publicly — the code is tied to your request.
                </Text>
              </div>

            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: "24px" }}>
              <Text style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 3px", lineHeight: "1.6" }}>
                © {new Date().getFullYear()} Candian's Cart · Invite-only family grocery platform
              </Text>
              <Text style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                Abbotsford, BC · canadianscart.ca
              </Text>
            </div>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}