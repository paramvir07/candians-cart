import { Resend } from "resend";
import * as React from "react";

type SendEmailProps = {
  to: string;
  subject: string;
  react: React.ReactElement;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, react }: SendEmailProps) {
  const { data, error } = await resend.emails.send({
    from: "Candian's Cart <onboarding@resend.dev>",
    to: process.env.NODE_ENV === "development" ? process.env.DEV_EMAIL! : to,
    subject,
    react,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
