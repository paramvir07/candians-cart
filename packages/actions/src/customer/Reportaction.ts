"use server";

import ReportModel from "@canadian-cart/db/models/customer/Report.model";
import { reportSchema } from "@canadian-cart/types/schemas/customer/report";
import { HelpFormConfirmation, SendtoAdmin } from "../resend/ResendActions";
import { FormErrors, FormState } from "@canadian-cart/types/customer/helpForm";


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
    await SendtoAdmin(parsed.data)

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

