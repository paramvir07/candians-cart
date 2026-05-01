"use server";

import ReportModel from "@/db/models/customer/Report.model";
import { reportSchema } from "@/zod/schemas/customer/report";
import { HelpFormConfirmation } from "../resend/ResendActions";
import { FormErrors, FormState } from "@/types/customer/helpForm";


export const ReportSubmit = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const raw = {
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      category: formData.get("category"),
    };

    const parsed = reportSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as FormErrors,
      };
    }

    await ReportModel.create(parsed.data);
    await HelpFormConfirmation(parsed.data);

    return {
      success: true,
      errors: {},
    };
  } catch (err) {
    console.error(err);

    return {
      success: false,
      errors: {
        message: ["Something went wrong. Try again."],
      },
    };
  }
};

