import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { phoneNumber } from "better-auth/plugins";
import { ac, roles } from "./roles";
import { sendEmail } from "./email";
import { VerifyEmail } from "@/components/EmailTemplates/VerifyEmail";
import { sendSMS } from "../twilio/twilio";
import Customer from "@/db/models/customer/customer.model";
import { dbConnect } from "@/db/dbConnect";
import { revalidateCustomerCache } from "@/actions/cache/user.cache";
import { revalidatePath, revalidateTag } from "next/cache";
import Store from "@/db/models/store/store.model";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { APIError } from "better-auth/api";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI as string);
const db = client.db();

type GiftCartRole = "customer" | "admin";

function getGiftCartRole(user: unknown): GiftCartRole {
  if (typeof user !== "object" || user === null || !("role" in user)) {
    throw new APIError("FORBIDDEN", {
      message: "This account does not have a valid role.",
    });
  }

  const role = (user as { role?: unknown }).role;

  if (role !== "customer" && role !== "admin") {
    throw new APIError("FORBIDDEN", {
      message:
        "Only Canadian's Cart customers and administrators can access Gift Cart.",
    });
  }

  return role;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!, process.env.GC_APP_URL!],
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
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      let targetEmail = user.email;
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64url").toString(),
        );
        if (payload.email) targetEmail = payload.email;
      } catch (err) {
        console.error("[sendVerificationEmail] failed to decode token:", err);
      }

      const isEmailChange = targetEmail !== user.email;

      const u = new URL(url);
      u.searchParams.set(
        "callbackURL",
        isEmailChange
          ? "/email-verified?type=change"
          : "/email-verified?type=signup",
      );

      await sendEmail({
        to: targetEmail,
        subject: isEmailChange
          ? "Confirm your new email address"
          : "Verify your email address",
        react: (
          <VerifyEmail
            username={user.name}
            verifyUrl={u.toString()}
            appName="Candian's Cart"
          />
        ),
      });
    },
    afterEmailVerification: async (user) => {
      const role = (user as any).role as string | undefined;
      try {
        await dbConnect();
        if (role === "customer") {
          await Customer.updateOne(
            { userId: user.id },
            { $set: { email: user.email } },
          );
          revalidateTag("customer", "max");
          revalidateTag("customer-and-store", "max");
        }
        if (role === "store") {
          await Store.updateOne(
            { userId: user.id },
            { $set: { email: user.email } },
          );
        }
        if (role) revalidatePath(`/${role}/profile`);
      } catch (err) {
        console.error("[afterEmailVerification] sync failed:", err);
      }
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "customer",
    }),

    jwt(),

    oauthProvider({
      loginPage: "/customer/login",
      consentPage: "/oauth/consent",

      scopes: ["openid", "profile", "email", "offline_access"],

      customIdTokenClaims: ({ user }) => {
        const role = getGiftCartRole(user);

        return {
          gc_role: role,
        };
      },

      customAccessTokenClaims: ({ user }) => {
        const role = getGiftCartRole(user);

        return {
          gc_role: role,
        };
      },

      customUserInfoClaims: ({ user, scopes }) => {
        const role = getGiftCartRole(user);

        const claims: {
          gc_role: GiftCartRole;
          phone_number?: string;
        } = {
          gc_role: role,
        };

        /*
         * Phone is included only for customers.
         * Admins do not need phone or phone verification in Gift Cart.
         */
        if (role === "customer" && scopes.includes("profile")) {
          const phoneNumber = (
            user as {
              phoneNumber?: unknown;
            }
          ).phoneNumber;

          if (
            typeof phoneNumber === "string" &&
            phoneNumber.trim().length > 0
          ) {
            claims.phone_number = phoneNumber.trim();
          }
        }

        return claims;
      },

      advertisedMetadata: {
        claims_supported: ["gc_role", "phone_number"],
      },

      silenceWarnings: {
        oauthAuthServerConfig: true,
      },
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

export { db };
