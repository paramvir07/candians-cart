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

interface ReferralRequestEmailProps {
  recipientName?: string | null
  requesterName: string
  manageRequestsUrl: string
  appName?: string
  supportEmail?: string
}

export default function ReferralRequestEmail({
  recipientName,
  requesterName,
  manageRequestsUrl,
  appName = "Candian's Cart",
  supportEmail = "info@canadianscart.ca",
}: ReferralRequestEmailProps) {

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>{requesterName} asked you for a referral on {appName}.</Preview>

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

                {/* Icon circle */}
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
                        🙋
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Referral request badge */}
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
                          ✦ Referral Request
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
                  Hi{recipientName ? ` ${recipientName.split(" ")[0]}` : ""}, someone needs your help. 🤝
                </Heading>

                <Text style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.8", margin: 0 }}>
                  <span style={{ fontWeight: "700", color: "#111827" }}>{requesterName}</span>{" "}
                  requested a referral from you on{" "}
                  <span style={{ fontWeight: "700", color: "#111827" }}>{appName}</span>.
                  You can accept or decline whenever you're ready.
                </Text>
              </div>

              {/* Action block */}
              <div style={{ padding: "0 44px 32px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "1.5px solid #86efac",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  textAlign: "center",
                }}>
                  <Text style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#16a34a", margin: "0 0 14px" }}>
                    Review the request
                  </Text>

                  <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                    <tbody>
                      <tr>
                        <td style={{
                          backgroundColor: "#16a34a",
                          borderRadius: "10px",
                        }}>
                          <a
                            href={manageRequestsUrl}
                            style={{
                              display: "inline-block",
                              padding: "12px 28px",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#ffffff",
                              textDecoration: "none",
                            }}
                          >
                            Manage requests
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info banner */}
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
                        <td style={{ width: "28px", verticalAlign: "top", paddingRight: "12px", fontSize: "18px", paddingTop: "1px" }}>ℹ️</td>
                        <td>
                          <Text style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", margin: "0 0 3px" }}>
                            No action needed if you'd rather not respond
                          </Text>
                          <Text style={{ fontSize: "12px", color: "#a16207", margin: 0, lineHeight: "1.6" }}>
                            If you accept, your referral code will be sent to {requesterName} automatically.
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0 44px" }} />

              {/* Footer note */}
              <div style={{ padding: "24px 44px 40px", textAlign: "center" }}>
                <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", lineHeight: "1.7" }}>
                  Questions? Reply to this email or write to{" "}
                  <span style={{ color: "#64748b", fontWeight: "600" }}>{supportEmail}</span>.
                </Text>
              </div>

            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: "24px" }}>
              <Text style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 3px", lineHeight: "1.6" }}>
                © {new Date().getFullYear()} {appName} · Invite-only family grocery platform
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