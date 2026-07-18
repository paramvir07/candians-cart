import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Hr,
  Preview,
  Link,
} from "@react-email/components";

interface AdminNotificationEmailProps {
  userEmail: string;
  category: "bug" | "question" | "feature" | "other";
  subject: string;
  message: string;
}

// global.css OKLCH → hex conversions
// --primary:   oklch(0.6271 0.1699 149.2138) → #4d9e6a  (green)
// --background:oklch(1 0 0)                  → #ffffff
// --foreground:oklch(0.2661 0.0625 153.0394) → #2d4a36
// --secondary: oklch(0.9669 0.0287 158.0617) → #e8f5ec
// --secondary-foreground: oklch(0.4104 0.1066 149.9393) → #3a7a4f
// --muted:     oklch(0.9719 0.0055 158.5966) → #f3f7f4
// --muted-foreground: oklch(0.5252 0.0315 157.3462) → #6b8f74
// --border:    oklch(0.9324 0.0207 158.2303) → #daeee0
// --card:      oklch(1 0 0)                  → #ffffff
// --destructive: oklch(0.6356 0.2082 25.3782) → #d94f2a
// --sidebar:   oklch(0.9859 0.0027 158.6587) → #f7faf8
// --accent:    oklch(0.9669 0.0287 158.0617) → #e8f5ec
// --ring:      oklch(0.6271 0.1699 149.2138) → #4d9e6a

const CC = {
  primary:           "#4d9e6a",
  primaryDark:       "#166534", // green-800 from contact form
  primaryDeep:       "#15803d", // green-700
  primaryLight:      "#e8f5ec", // --secondary
  primaryLighter:    "#f0fdf4", // green-50
  primaryBorder:     "#bbf7d0", // green-200
  background:        "#f5f0e8", // parchment from contact form
  card:              "#ffffff",
  foreground:        "#2d4a36",
  muted:             "#f3f7f4",
  mutedForeground:   "#6b8f74",
  border:            "#daeee0",
  sidebar:           "#f7faf8",
  destructive:       "#d94f2a",
  text:              "#111827",
  textSoft:          "#374151",
  textMuted:         "#9ca3af",
};

const CATEGORY_MAP = {
  bug:      { label: "Bug Report",     emoji: "🐛", color: CC.destructive, bg: "#fef2f2", border: "#fecaca" },
  question: { label: "Question",        emoji: "❓", color: CC.primaryDeep,  bg: CC.primaryLighter, border: CC.primaryBorder },
  feature:  { label: "Feature Request", emoji: "✨", color: CC.primaryDark,  bg: CC.primaryLight,   border: CC.primaryBorder },
  other:    { label: "Other",           emoji: "💬", color: CC.mutedForeground, bg: CC.muted,       border: CC.border },
};

export default function AdminNotificationEmail({
  userEmail,
  category,
  subject,
  message,
}: AdminNotificationEmailProps) {
  const cat = CATEGORY_MAP[category];
  const now = new Date().toLocaleString("en-CA", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "America/Vancouver",
  });

  return (
    <Html lang="en">
      <Head />
      <Preview>
        [{cat.label}] {subject} — from {userEmail}
      </Preview>

      <Body style={{
        backgroundColor: CC.background,
        margin: 0,
        padding: "32px 0",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}>
        <Container style={{ maxWidth: 580, margin: "0 auto" }}>

          {/* ── Header ── */}
          <Section style={{
            backgroundColor: CC.primaryDark,
            borderRadius: "20px 20px 0 0",
            padding: "26px 36px 22px",
          }}>
            <Row>
              <Column>
                <Text style={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}>
                  🍁 Canadian Cart
                </Text>
                <Text style={{
                  color: CC.primaryBorder,
                  fontSize: 10,
                  fontWeight: 700,
                  margin: "3px 0 0",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}>
                  Admin Notification
                </Text>
              </Column>
              <Column align="right">
                <Text style={{
                  display: "inline-block",
                  backgroundColor: cat.bg,
                  color: cat.color,
                  border: `1px solid ${cat.border}`,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                  margin: 0,
                  letterSpacing: "0.04em",
                }}>
                  {cat.emoji} {cat.label}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── Green accent strip ── */}
          <Section style={{
            backgroundColor: CC.primaryDeep,
            padding: "0 36px",
            textAlign: "center",
          }}>
            <Text style={{
              display: "inline-block",
              backgroundColor: CC.primaryLight,
              color: CC.primaryDark,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 999,
              padding: "5px 18px",
              margin: "14px auto",
            }}>
              New Support Request
            </Text>
          </Section>

          {/* ── Card body ── */}
          <Section style={{
            backgroundColor: CC.card,
            padding: "32px 36px",
          }}>

            {/* Meta row: From / Time */}
            <Section style={{
              backgroundColor: CC.sidebar,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              border: `1px solid ${CC.border}`,
            }}>
              <Row>
                <Column style={{ width: 56 }}>
                  <Text style={labelStyle}>From</Text>
                </Column>
                <Column>
                  <Text style={{ ...valueStyle, color: CC.primaryDeep }}>
                    <Link href={`mailto:${userEmail}`} style={{ color: CC.primaryDeep, textDecoration: "underline" }}>
                      {userEmail}
                    </Link>
                  </Text>
                </Column>
              </Row>
              <Row style={{ marginTop: 10 }}>
                <Column style={{ width: 56 }}>
                  <Text style={labelStyle}>Time</Text>
                </Column>
                <Column>
                  <Text style={valueStyle}>{now}</Text>
                </Column>
              </Row>
            </Section>

            {/* Category */}
            <Text style={labelStyle}>Category</Text>
            <Text style={{
              display: "inline-block",
              backgroundColor: cat.bg,
              color: cat.color,
              border: `1px solid ${cat.border}`,
              fontSize: 13,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 999,
              margin: "4px 0 22px",
            }}>
              {cat.emoji}&nbsp;&nbsp;{cat.label}
            </Text>

            <Hr style={{ borderColor: CC.border, margin: "4px 0 22px" }} />

            {/* Subject */}
            <Text style={labelStyle}>Subject</Text>
            <Text style={{
              fontSize: 17,
              fontWeight: 700,
              color: CC.text,
              margin: "4px 0 24px",
              letterSpacing: "-0.02em",
              lineHeight: "1.3",
            }}>
              {subject}
            </Text>

            <Hr style={{ borderColor: CC.border, margin: "0 0 22px" }} />

            {/* Message */}
            <Text style={labelStyle}>Message</Text>
            <Section style={{
              backgroundColor: CC.muted,
              borderRadius: 10,
              padding: "16px 20px",
              marginTop: 8,
              border: `1px solid ${CC.border}`,
              borderLeft: `3px solid ${CC.primary}`,
            }}>
              <Text style={{
                fontSize: 14,
                color: CC.textSoft,
                lineHeight: "1.75",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                {message}
              </Text>
            </Section>

          </Section>

          {/* ── Action strip ── */}
          <Section style={{
            backgroundColor: CC.primaryLight,
            border: `1px solid ${CC.primaryBorder}`,
            borderTop: "none",
            padding: "14px 36px",
          }}>
            <Text style={{
              fontSize: 12,
              color: CC.primaryDark,
              margin: 0,
              fontWeight: 600,
            }}>
              📋 Open the admin panel to accept and respond to this request.
            </Text>
          </Section>

          {/* ── Footer ── */}
          <Section style={{
            backgroundColor: CC.primaryDark,
            borderRadius: "0 0 20px 20px",
            padding: "14px 36px",
          }}>
            <Text style={{
              fontSize: 10,
              color: CC.primaryBorder,
              margin: 0,
              textAlign: "center",
              letterSpacing: "0.04em",
            }}>
              Canadian Cart · Internal Admin Notification · Do not reply
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

/* ── Shared styles ── */
const labelStyle: React.CSSProperties = {
  color: CC.textMuted,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 4px",
};

const valueStyle: React.CSSProperties = {
  fontSize: 13,
  color: CC.text,
  fontWeight: 600,
  margin: 0,
};