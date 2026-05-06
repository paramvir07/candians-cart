"use server";

import HelpFormEmail from "@/components/EmailTemplates/HelpFormEmail";
import { render } from "@react-email/components";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface HelpFormEmailData {
  email: string;
  category: "bug" | "question" | "feature" | "other";
  subject: string;
  message: string;
}

export const HelpFormConfirmation = async (data: HelpFormEmailData) => {
  try {
    const response = await resend.emails.send({
      from:
        process.env.NODE_ENV === "development"
          ? "Candian's Cart <onboarding@resend.dev>"
          : "Candian's Cart <no-reply@canadianscart.ca>",
      to:
        process.env.NODE_ENV === "development"
          ? [process.env.DEV_EMAIL!]
          : [data.email],
      subject: `We received your ${data.subject}`,
      // server action file should be in tsx to render react elements
      html: await render(
        <HelpFormEmail
          userEmail={data.email}
          category={data.category}
          subject={data.subject}
          message={data.message}
        />,
      ),
    });

    return Response.json(response, {
      status: response.error ? 500 : 200,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
};