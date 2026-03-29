"use server";

import ReportModel from "@/db/models/customer/Report.model";
import { reportSchema } from "@/zod/schemas/customer/report";
import { HelpFormConfirmation } from "../resend/ResendActions";

export const ReportSubmit = async(_prevState: unknown, formData: FormData) =>{
  try{
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
        
        await HelpFormConfirmation(parsed.data)

        return {success: true, errors: null,};

  }catch(err){
    console.log(err)
    return {success:false, errors:err}
  }

}
