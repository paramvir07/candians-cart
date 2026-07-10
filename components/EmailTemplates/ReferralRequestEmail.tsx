import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
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
  appName = "Canadian's Cart",
  supportEmail = "info@canadianscart.ca",
}: ReferralRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {requesterName} asked you for a referral on {appName}.
      </Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={paragraph}>
            Hi{recipientName ? ` ${recipientName}` : ""},
          </Text>

          <Text style={paragraph}>
            {requesterName} requested a referral from you on {appName}.
          </Text>

          <Text style={paragraph}>
            You can review the request and choose to accept or decline it
            here:
          </Text>

          <Text style={paragraph}>
            <Link href={manageRequestsUrl} style={link}>
              {manageRequestsUrl}
            </Link>
          </Text>

          <Text style={paragraph}>
            If you accept, your referral code will be sent to{" "}
            {requesterName} automatically. No action is needed if you'd
            rather not respond.
          </Text>

          <Text style={paragraph}>
            Thanks,
            <br />
            The {appName} Team
          </Text>

          <Text style={footer}>
            Questions? Reply to this email or write to{" "}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: 0,
  padding: "24px",
  fontFamily:
    'Arial, Helvetica, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const link: React.CSSProperties = {
  color: "#1a73e8",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#6b6b6b",
  margin: "24px 0 0",
};