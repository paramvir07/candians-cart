// components/EmailTemplates/ForgotPasswordEmail.tsx
import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ForgotPasswordEmailProps = {
  username?: string | null;
  resetUrl: string;
  appName?: string;
  supportEmail?: string;
  websiteUrl?: string;
};

export function ForgotPasswordEmail({
  username,
  resetUrl,
  appName = "Candian's Cart",
  supportEmail = "info@canadianscart.ca",
  websiteUrl = "https://www.canadianscart.ca",
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <div style={topBar} />
            <Section style={heroSection}>
              <table
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
                style={{ margin: "0 auto 20px" }}
              >
                <tbody>
                  <tr>
                    <td style={heroIconWrap}>🔐</td>
                  </tr>
                </tbody>
              </table>
              <Text style={eyebrow}>{appName}</Text>
              <Heading style={heading}>Reset your password</Heading>
              <Text style={heroText}>
                Hi{username ? ` ${username}` : ""}, we received a request to
                reset your password. Click the button below to choose a new one.
                This link expires in 1 hour.
              </Text>
              <Section style={buttonWrap}>
                <Button href={resetUrl} style={button}>
                  Reset Password
                </Button>
              </Section>
              <Text style={subtleText}>
                If you didn't request this, you can safely ignore this email.
              </Text>
            </Section>

            <div style={divider} />

            <Section style={contentSection}>
              <Text style={sectionLabel}>Reset link</Text>
              <div style={linkBox}>
                <Text style={linkBoxLabel}>
                  If the button doesn't work, paste this into your browser:
                </Text>
                <Link href={resetUrl} style={linkText}>
                  {resetUrl}
                </Link>
              </div>
              <div style={noticeBox}>
                <Text style={noticeTitle}>Didn't request this?</Text>
                <Text style={noticeText}>
                  Your password will remain unchanged. No action is required on
                  your end.
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            <Section style={footerSection}>
              <Text style={supportText}>
                Need help? Contact{" "}
                <Link href={`mailto:${supportEmail}`} style={footerLink}>
                  {supportEmail}
                </Link>
              </Text>
              <Text style={footerMeta}>
                Automated email from {appName}. Do not reply directly.
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

// ── styles (same palette as VerifyEmail) ──────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: "#f3f8f4",
  margin: 0,
  padding: "40px 16px",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
const container: React.CSSProperties = { maxWidth: "560px", margin: "0 auto" };
const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfece3",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};
const topBar: React.CSSProperties = {
  height: "5px",
  background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)",
};
const heroSection: React.CSSProperties = {
  padding: "40px 36px 28px",
  textAlign: "center",
};
const heroIconWrap: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "999px",
  backgroundColor: "#eefbf1",
  border: "1.5px solid #b7ebc1",
  textAlign: "center",
  verticalAlign: "middle",
  fontSize: "28px",
  lineHeight: "64px",
};
const eyebrow: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#5f7d69",
};
const heading: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "30px",
  lineHeight: "1.2",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "#1e4a36",
};
const heroText: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "420px",
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#5d7064",
};
const buttonWrap: React.CSSProperties = { margin: "28px 0 16px" };
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
const contentSection: React.CSSProperties = { padding: "28px 36px" };
const sectionLabel: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#91a598",
};
const linkBox: React.CSSProperties = {
  backgroundColor: "#f7fbf8",
  border: "1px solid #dfece3",
  borderLeft: "3px solid #20a24a",
  borderRadius: "12px",
  padding: "16px 18px",
  marginBottom: "16px",
};
const linkBoxLabel: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#698071",
};
const linkText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.7",
  color: "#1d7f44",
  wordBreak: "break-all",
  textDecoration: "underline",
};
const noticeBox: React.CSSProperties = {
  backgroundColor: "#f3f8f4",
  border: "1px solid #e3ece6",
  borderRadius: "12px",
  padding: "14px 16px",
};
const noticeTitle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#214131",
};
const noticeText: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.65",
  color: "#698071",
};
const hr: React.CSSProperties = { borderColor: "#edf4ef", margin: 0 };
const footerSection: React.CSSProperties = {
  padding: "24px 36px 30px",
  textAlign: "center",
};
const footerLink: React.CSSProperties = {
  color: "#1d7f44",
  textDecoration: "underline",
};
const supportText: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "12px",
  lineHeight: "1.7",
  color: "#789084",
};
const footerMeta: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#97aa9e",
};
const copyright: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#97aa9e",
};
