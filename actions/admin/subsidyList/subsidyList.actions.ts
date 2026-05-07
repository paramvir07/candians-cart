"use server"
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import SubsidisedList from "@/db/models/admin/subsidisedList.model";
import { IFormActionResponse } from "@/types/form";
import {
  createSubsidyListItemSchema,
  updateSubsidyListItemSchema,
} from "@/zod/schemas/admin/subsidyList";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";

// ─── GET ────────────────────────────────────────────────────────────────────

export const getSubsidisedList = async () => {
  try {
    await dbConnect();
    const subsidisedList = await SubsidisedList.find().lean();
    return {
      success: true,
      message: "Fetched subsidy list successfully",
      subsidisedList: JSON.parse(JSON.stringify(subsidisedList)),
    };
  } catch (error) {
    console.error("Error fetching subsidy list:", error);
    return {
      success: false,
      message: "Something went wrong while fetching subsidy list",
      subsidisedList: [],
    };
  }
};

// ─── CREATE ─────────────────────────────────────────────────────────────────

export const createSubsidyListItemAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const rawData = formDataToObject(formData);
    const result = createSubsidyListItemSchema.safeParse(rawData);
    if (!result.success)
      return {
        success: false,
        message: zodErrorResponse(result) || "Validation error",
      };

    await dbConnect();
    await SubsidisedList.create({
      name: result.data.name,
      category: result.data.category,
    });
    return { success: true, message: "Subsidy item created successfully" };
  } catch (error) {
    console.error("Error creating subsidy item:", error);
    return {
      success: false,
      message: "Something went wrong while creating subsidy item",
    };
  }
};

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export const updateSubsidyListItemAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const rawData = formDataToObject(formData);
    const result = updateSubsidyListItemSchema.safeParse(rawData);
    if (!result.success)
      return {
        success: false,
        message: zodErrorResponse(result) || "Validation error",
      };

    await dbConnect();
    const updated = await SubsidisedList.findByIdAndUpdate(
      result.data.id,
      { name: result.data.name, category: result.data.category },
      { returnDocument: "after" },
    );
    if (!updated) return { success: false, message: "Item not found" };
    return { success: true, message: "Subsidy item updated successfully" };
  } catch (error) {
    console.error("Error updating subsidy item:", error);
    return {
      success: false,
      message: "Something went wrong while updating subsidy item",
    };
  }
};

// ─── DELETE ─────────────────────────────────────────────────────────────────

export const deleteSubsidyListItemAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const id = formData.get("id") as string;
    if (!id) return { success: false, message: "Item ID is required" };

    await dbConnect();
    const deleted = await SubsidisedList.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Item not found" };
    return { success: true, message: "Subsidy item deleted successfully" };
  } catch (error) {
    console.error("Error deleting subsidy item:", error);
    return {
      success: false,
      message: "Something went wrong while deleting subsidy item",
    };
  }
};
