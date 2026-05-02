import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { ac, roles } from "./roles";
import { sendEmail } from "./email";
import { VerifyEmail } from "@/components/EmailTemplates/VerifyEmail";
import { ForgotPasswordEmail } from "@/components/EmailTemplates/ForgotPasswordEmail";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Candian's Cart account password",
        react: (
          <ForgotPasswordEmail
            username={user.name}
            resetUrl={url}
            appName="Candian's Cart"
          />
        ),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: (
          <VerifyEmail
            username={user.name}
            verifyUrl={url}
            appName="Candian's Cart"
          />
        ),
      });
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "customer",
    }),
    nextCookies(),
  ],
});
