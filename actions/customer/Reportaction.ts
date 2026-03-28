"use server";

import ReportModel from "@/db/models/customer/Report.model";
import { reportSchema } from "@/zod/schemas/customer/report";

export const ReportSubmit = async(_prevState: unknown, formData: FormData) =>{
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
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await ReportModel.create(parsed.data);

  return {
    success: true,
    errors: {},
  };
}
