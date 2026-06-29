import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { phoneNumber } from "better-auth/plugins"; // ADD
import { ac, roles } from "./roles";
import { sendEmail } from "./email";
import { VerifyEmail } from "@/components/EmailTemplates/VerifyEmail";
import { ForgotPasswordEmail } from "@/components/EmailTemplates/ForgotPasswordEmail";
import { ChangeEmailConfirmationEmail } from "@/components/EmailTemplates/ChangeEmailConfirmation";
import { sendSMS } from "../twilio/twilio";
import Customer from "@/db/models/customer/customer.model";
import { dbConnect } from "@/db/dbConnect";
import { revalidateCustomerCache } from "@/actions/cache/user.cache";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  session: {
    expiresIn: 60 * 60 * 24 * 365,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      phoneNumberVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ newEmail, user, url }) => {
        const u = new URL(url);
        u.searchParams.set("callbackURL", "/email-verified?type=confirmation");
        await sendEmail({
          to: user.email,
          subject: "Verify email change",
          react: (
            <ChangeEmailConfirmationEmail
              username={user.name}
              confirmUrl={u.toString()}
              newEmail={newEmail}
              appName="Candian's Cart"
            />
          ),
        });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
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
      const u = new URL(url);
      const token = u.searchParams.get("token");
      let requestType = "verify";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          requestType = payload.requestType ?? "verify";
        } catch (err) {
          console.error("[emailVerification] failed to decode token:", err);
        }
      }
      if (requestType === "change-email-verification") {
        u.searchParams.set("callbackURL", "/api/auth/email-change");
      } else {
        u.searchParams.set("callbackURL", "/email-updated");
      }
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: (
          <VerifyEmail
            username={user.name}
            verifyUrl={u.toString()}
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
    phoneNumber({
      otpLength: 6,
      expiresIn: 600,
      requireVerification: true,
      sendOTP: async ({ phoneNumber, code }) => {
        await sendSMS(
          phoneNumber,
          `Your Candian's Cart verification code is: ${code}. It expires in 10 minutes.\n@canadianscart.ca #${code}`,
        );
      },

      callbackOnVerification: async ({ phoneNumber, user }) => {
        try {
          await dbConnect();
          const { Types } = await import("mongoose");

          const result = await Customer.findOneAndUpdate(
            { userId: new Types.ObjectId(user.id) },
            { mobile: phoneNumber },
          );

          if (!result) {
            console.error(
              "[callbackOnVerification] customer not found for userId:",
              user.id,
            );
          }

          await revalidateCustomerCache();
        } catch (err) {
          console.error("Callback on phone number verification failed:", err);
        }
      },
    }),
  ],
});

// at the bottom of auth.tsx
export { db };
