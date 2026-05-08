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

export const signupAction = async (
  userRole: UserRole,
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const rawData = formDataToObject(formData);

    if (userRole === "customer") {
      const result = CustomerSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;
      if (data.province !== "BC") {
        return { success: false, message: "Province must be BC" };
      }

      const allowedCities = [
        "Vancouver",
        "Burnaby",
        "New Westminster",
        "Coquitlam",
        "Port Coquitlam",
        "Port Moody",
        "Surrey",
        "Delta",
        "Langley",
        "Maple Ridge",
        "Pitt Meadows",
        "Abbotsford",
        "Mission",
        "Chilliwack",
        "Agassiz",
        "Hope",
      ];

      if (!allowedCities.includes(data.city)) {
        return { success: false, message: "Invalid city selected" };
      }
      await dbConnect();

      // Validate referral code before starting the transaction
      const referralCode = await ReferralCode.findOne({
        code: data.referralCode,
      });

      if (!referralCode)
        return { success: false, message: "Referral Code not found" };

      const inactive = !referralCode.isActive;
      const usageFull =
        referralCode.maxUses && referralCode.uses >= referralCode.maxUses;
      const expired =
        referralCode.expiresAt &&
        referralCode.expiresAt.getTime() <= Date.now();

      if (inactive || usageFull || expired)
        return {
          success: false,
          message: "Sorry, the referral code is no longer valid.",
        };

      // Check if store exists before starting the transaction
      const store = await Store.findById(data.associatedStore);

      if (!store) return { success: false, message: "Store not found" };

      // Create auth user before transaction since it's an external system
      const newCustomerUser = await auth.api.signUpEmail({
        body: { name: data.name, email: data.email, password: data.password },
      });

      if (!newCustomerUser)
        return {
          success: false,
          message: "Something went wrong while creating account",
        };

      // Start transaction for all DB writes
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const customer = await Customer.create(
          [
            {
              userId: newCustomerUser.user.id,
              name: data.name,
              email: data.email,
              mobile: data.mobile,
              address: data.address,
              city: data.city,
              province: data.province,
              monthlyBudget: data.monthlyBudget * 100,
              associatedStoreId: data.associatedStore,
              referralCode: data.referralCode,
            },
          ],
          { session },
        );

        if (!customer[0])
          throw new Error("Something went wrong while creating account");

        const newStoreMember = await Store.findByIdAndUpdate(
          data.associatedStore,
          { $addToSet: { members: customer[0]._id } },
          { returnDocument: "after" },
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
        // Auth user was created but DB failed — you may want to delete the auth user here
        console.log("Transaction failed, rolling back: ", err);
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
        message:
          "Your account has been created. We’ve sent a verification link to your email. Please verify your email and then log in.",
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
      if (!store) return { success: false, message: "Store not found" };

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
      message: "Something went wrong while creating account",
    };
  }
};
