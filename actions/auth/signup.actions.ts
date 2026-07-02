"use server";

import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import { Cashier } from "@/db/models/cashier/cashier.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@/types/auth";
import { IFormActionResponse } from "@/types/form";
import { adminSignupSchema } from "@/zod/schemas/admin/adminSignup";
import { cashierSchema } from "@/zod/schemas/cashier/cashierSchema";
import { CustomerSchema } from "@/zod/schemas/customer/customerSignup";
import { storeSignupSchema } from "@/zod/schemas/store/storeSignup";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import mongoose from "mongoose";
import { getUserSession } from "./getUserSession.actions";
import { ObjectId } from "mongodb";

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("email") &&
      (message.includes("exist") || message.includes("already"))
    ) {
      return "An account with this email already exists.";
    }

    return error.message;
  }

  return "Something went wrong while creating account";
};

export const signupAction = async (
  userRole: UserRole,
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const rawData = formDataToObject(formData);

    if (userRole === "customer") {
      const result = await CustomerSchema.safeParseAsync(rawData);

      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;

      await dbConnect();

      const referralCode = await ReferralCode.findOne({
        code: data.referralCode,
      });

      if (!referralCode) {
        return { success: false, message: "Referral Code not found" };
      }

      const inactive = !referralCode.isActive;

      const usageFull =
        referralCode.maxUses && referralCode.uses >= referralCode.maxUses;

      const expired =
        referralCode.expiresAt &&
        referralCode.expiresAt.getTime() <= Date.now();

      if (inactive || usageFull) {
        return {
          success: false,
          message: "Sorry, the referral code is no longer valid.",
        };
      }

      if (expired) {
        if (referralCode.type === "customer") {
          referralCode.uses = 0;
          await referralCode.save();

          const customer = await Customer.findOneAndUpdate(
            { referralCode: referralCode._id },
            { $set: { perReferAmount: 2 } },
            { new: true },
          );

          if (!customer) {
            return {
              success: false,
              message: "Customer not found for this referral code.",
            };
          }
        } else {
          return {
            success: false,
            message: "Sorry, the referral code is no longer valid.",
          };
        }
      }

      const store = await Store.findById(data.associatedStore);

      if (!store) {
        return { success: false, message: "Store not found" };
      }

      if (!store.isActive) {
        return {
          success: false,
          message:
            "This store is currently inactive. Please choose another store.",
        };
      }

      // Create auth user
      const newCustomerUser = await auth.api.signUpEmail({
        body: { name: data.name, email: data.email, password: data.password },
      });

      if (!newCustomerUser) {
        return {
          success: false,
          message: "Something went wrong while creating account",
        };
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let subsidy = 55;

        if (referralCode.type === "customer") {
          const referredCustomer = await Customer.findById(
            referralCode.customerId,
          ).session(session);

          if (!referredCustomer) throw new Error("Referral customer not found");

          subsidy = Math.max((referredCustomer.subsidy ?? 55) - 1, 50);
        }

        const customer = await Customer.create(
          [
            {
              userId: newCustomerUser.user.id,
              name: data.name,
              email: data.email,
              address: data.address,
              city: data.city,
              province: data.province,
              postalCode: data.postalCode,
              heardAboutUs: data.heardAboutUs,
              monthlyBudget: data.monthlyBudget * 100,
              associatedStoreId: data.associatedStore,
              referralCodeId: referralCode._id,
              subsidy,
            },
          ],
          { session },
        );

        if (!customer[0])
          throw new Error("Something went wrong while creating account");

        const newStoreMember = await Store.findByIdAndUpdate(
          data.associatedStore,
          { $inc: { members: 1 } },
          { returnDocument: "after", session },
        );

        if (!newStoreMember)
          throw new Error("Something went wrong while creating account");

        await ReferralCode.findByIdAndUpdate(
          referralCode._id,
          { $inc: { uses: 1 } },
          { session },
        );

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();

        try {
          const { db } = await import("@/lib/auth/auth");

          const authUserObjectId = new ObjectId(newCustomerUser.user.id);

          await db.collection("user").deleteOne({
            _id: authUserObjectId,
          });

         await db.collection("account").deleteMany({
            userId: authUserObjectId,
          });

          await db.collection("session").deleteMany({
            userId: authUserObjectId,
          });

        } catch (deleteErr) {
          console.error("Failed to delete orphan auth user:", deleteErr);
        }

        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong while creating account",
        };
      } finally {
        session.endSession();
      }

      return {
        success: true,
        message: "Account created! Let's verify your phone number.",
      };
    } else if (userRole === "store") {
      const session = await getUserSession();
      const adminRole = session.user.role === "admin";
      if (!adminRole) return { success: false, message: "Unauthorized" };

      const result = storeSignupSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;
      const newStoreUser = await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "store",
        },
      });

      if (!newStoreUser)
        return {
          success: false,
          message: "Something went wrong while creating account",
        };

      await dbConnect();
      await Store.create({
        userId: newStoreUser.user.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
      });
      return {
        success: true,
        message:
          "Store account created successfully. The user can now verify their email and log in using the provided credentials.",
      };
    } else if (userRole === "cashier") {
      const session = await getUserSession();
      const adminRole = session.user.role === "admin";
      if (!adminRole) return { success: false, message: "Unauthorized" };

      const result = cashierSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }
      const data = result.data;

      const store = await Store.findById(data.associatedStore);

      if (!store) {
        return { success: false, message: "Store not found" };
      }

      if (!store.isActive) {
        return {
          success: false,
          message:
            "This store is currently inactive. Cashier account cannot be created.",
        };
      }

      const newCashierUser = await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "cashier",
        },
      });

      if (!newCashierUser)
        return {
          success: false,
          message: "Something went wrong while creating cashier account",
        };

      await dbConnect();
      await Cashier.create({
        userId: newCashierUser.user.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        storeId: data.associatedStore,
      });
      return {
        success: true,
        message:
          "Cashier account created successfully. The user can now verify their email and log in using the provided credentials.",
      };
    } else if (userRole === "admin") {
      const session = await getUserSession();
      const adminRole = session.user.role === "admin";
      if (!adminRole) return { success: false, message: "Unauthorized" };

      const result = adminSignupSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;
      await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "admin",
        },
      });
      return {
        success: true,
        message:
          "Admin account created successfully. The user can now verify their email and log in using the provided credentials.",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong while creating account",
      };
    }
  } catch (error) {
    console.log("Error while creating new account: ", error);
    return {
      success: false,
      message: getAuthErrorMessage(error),
    };
  }
};
