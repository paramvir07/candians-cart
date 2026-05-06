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

type ChangeEmailProps = {
  username?: string | null;
  confirmUrl: string;
  newEmail: string;
  appName?: string;
  supportEmail?: string;
};

export function ChangeEmailConfirmationEmail({
  username,
  confirmUrl,
  newEmail,
  appName = "Candian's Cart",
  supportEmail = "support@candianscart.ca",
}: ChangeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Confirm your email change request for {appName}
      </Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={heroSection}>
              <Heading style={heading}>
                Confirm your email change
              </Heading>

              <Text style={heroText}>
                Hi{username ? ` ${username}` : ""}, we received a request to change
                your account email to:
              </Text>

              <Text style={{ ...heroText, fontWeight: 700 }}>
                {newEmail}
              </Text>

              <Section style={buttonWrap}>
                <Button href={confirmUrl} style={button}>
                  Confirm Email Change
                </Button>
              </Section>

              <Text style={subtleText}>
                If you made this request, confirm it using the button above.
              </Text>
            </Section>

            <div style={divider} />

            <Section style={contentSection}>
              <Text style={noticeTitle}>
                Didn’t request this change?
              </Text>

              <Text style={noticeText}>
                If you did not request this, your account may be at risk.
                Please ignore this email and contact support immediately at{" "}
                <Link href={`mailto:${supportEmail}`} style={footerLink}>
                  {supportEmail}
                </Link>.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
  lineHeight: "16px",
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

const buttonWrap: React.CSSProperties = {
  margin: "28px 0 16px",
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
  lineHeight: "16px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#91a598",
};

const stepCircle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  backgroundColor: "#20a24a",
  color: "#ffffff",
  textAlign: "center",
  verticalAlign: "middle",
  fontSize: "11px",
  lineHeight: "24px",
  fontWeight: 800,
};

const stepTitle: React.CSSProperties = {
  margin: "0 0 2px",
  fontSize: "13px",
  lineHeight: "18px",
  fontWeight: 700,
  color: "#1f3f31",
};

const stepDesc: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.65",
  color: "#697d71",
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
  lineHeight: "18px",
  fontWeight: 700,
  color: "#214131",
};

const noticeText: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.65",
  color: "#698071",
};

const hr: React.CSSProperties = {
  borderColor: "#edf4ef",
  margin: 0,
};

const footerSection: React.CSSProperties = {
  padding: "24px 36px 30px",
  textAlign: "center",
};

const footerTitle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#5f7d69",
};

const footerLinks: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "13px",
  lineHeight: "1.7",
  color: "#6f8477",
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
