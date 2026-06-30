import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ReferralRequestEmailProps = {
  recipientName?: string | null;
  requesterName: string;
  manageRequestsUrl: string;
  appName?: string;
  supportEmail?: string;
};

export function ReferralRequestEmail({
  recipientName,
  requesterName,
  manageRequestsUrl,
  appName = "Candian's Cart",
  supportEmail = "info@canadianscart.ca",
}: ReferralRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{requesterName} has requested a referral invite.</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            {/* Hero */}
            <Section style={heroSection}>
              <Heading style={heading}>New Referral Request 👋</Heading>

              <Text style={heroText}>
                Hi{recipientName ? ` ${recipientName}` : ""},
              </Text>

              <Text style={heroText}>
                <strong style={{ color: "#1e4a36" }}>{requesterName}</strong>{" "}
                has requested a referral invite for {appName}. Review their
                request and decide whether you'd like to share your referral
                code.
              </Text>

              <Section style={buttonWrap}>
                <Button href={manageRequestsUrl} style={button}>
                  Review Request
                </Button>
              </Section>

              <Text style={subtleText}>
                If you approve the request, your referral code will be sent to{" "}
                {requesterName} automatically.
              </Text>
            </Section>

            <div style={divider} />

            {/* Info */}
            <Section style={contentSection}>
              <Text style={sectionLabel}>What happens next?</Text>

              {[
                {
                  emoji: "📨",
                  title: "Review the request",
                  desc: "Open your referral dashboard to see the request.",
                },
                {
                  emoji: "✅",
                  title: "Accept or decline",
                  desc: "You're in full control of who receives your referral code.",
                },
                {
                  emoji: "🎁",
                  title: "Share your referral",
                  desc: "Accepted users automatically receive your referral code.",
                },
              ].map(({ emoji, title, desc }) => (
                <Section key={title} style={perkRow}>
                  <Text style={perkEmoji}>{emoji}</Text>

                  <Section style={perkContent}>
                    <Text style={perkTitle}>{title}</Text>
                    <Text style={perkDesc}>{desc}</Text>
                  </Section>
                </Section>
              ))}
            </Section>

            <div style={divider} />

            {/* Fallback Link */}
            <Section style={contentSection}>
              <Text style={linkBoxLabel}>
                Button not working? Copy this link into your browser:
              </Text>

              <Section style={linkBox}>
                <Link href={manageRequestsUrl} style={linkText}>
                  {manageRequestsUrl}
                </Link>
              </Section>
            </Section>

            <div style={divider} />

            {/* Footer */}
            <Section style={footerSection}>
              <Text style={supportText}>
                Need help?{" "}
                <Link href={`mailto:${supportEmail}`} style={footerLink}>
                  {supportEmail}
                </Link>
              </Text>

              <Text style={copyright}>
                © {new Date().getFullYear()} {appName}. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f3f8f4",
  margin: 0,
  padding: "40px 16px",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfece3",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const heroSection: React.CSSProperties = {
  padding: "40px 36px 28px",
  textAlign: "center",
};

const heading: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "30px",
  lineHeight: "1.2",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "#1e4a36",
};

const heroText: React.CSSProperties = {
  margin: "0 auto 24px",
  maxWidth: "420px",
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#5d7064",
};

const codePillWrap: React.CSSProperties = {
  margin: "0 auto 8px",
};

const codePillLabel: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#91a598",
};

const codePill: React.CSSProperties = {
  display: "inline-block",
  margin: "0 auto",
  padding: "10px 28px",
  backgroundColor: "#eefbf1",
  border: "1.5px dashed #4ade80",
  borderRadius: "12px",
  fontSize: "26px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  color: "#166534",
  fontFamily: "monospace",
};

const buttonWrap: React.CSSProperties = {
  margin: "24px 0 16px",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#20a24a",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
  borderRadius: "10px",
  padding: "13px 22px",
};

const subtleText: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  lineHeight: "1.7",
  color: "#7a8f82",
};

const divider: React.CSSProperties = {
  height: "1px",
  backgroundColor: "#edf4ef",
  margin: "0 36px",
};

const contentSection: React.CSSProperties = {
  padding: "28px 36px",
};

const sectionLabel: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#91a598",
};

const perkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "16px",
};

const perkEmoji: React.CSSProperties = {
  margin: "0",
  fontSize: "20px",
  lineHeight: "1",
  flexShrink: 0,
  width: "28px",
};

const perkContent: React.CSSProperties = {
  flex: 1,
};

const perkTitle: React.CSSProperties = {
  margin: "0 0 2px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#1f3f31",
};

const perkDesc: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.65",
  color: "#697d71",
};

const linkBoxLabel: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "12px",
  color: "#698071",
};

const linkBox: React.CSSProperties = {
  backgroundColor: "#f7fbf8",
  border: "1px solid #dfece3",
  borderLeft: "3px solid #20a24a",
  borderRadius: "12px",
  padding: "14px 16px",
};

const linkText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.7",
  color: "#1d7f44",
  wordBreak: "break-all",
  textDecoration: "underline",
};

const footerSection: React.CSSProperties = {
  padding: "24px 36px 30px",
  textAlign: "center",
};

const footerLinks: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "13px",
  lineHeight: "1.7",
  color: "#6f8477",
};

const footerLink: React.CSSProperties = {
  color: "#1d7f44",
  textDecoration: "underline",
};

const supportText: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  lineHeight: "1.7",
  color: "#789084",
};

const copyright: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#97aa9e",
};
