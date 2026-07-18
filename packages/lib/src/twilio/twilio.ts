import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

export async function sendSMS(to: string, body: string) {
  try {
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
    console.log("[Twilio] SMS sent:", msg.sid, "| status:", msg.status);
  } catch (err) {
    console.error("[Twilio] SMS failed:", err);
    throw err;
  }
}
