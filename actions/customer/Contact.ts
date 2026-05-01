"use server"

import { dbConnect } from "@/db/dbConnect";
import ContactModel from "@/db/models/customer/Contact.model";
import { contactSchema } from "@/zod/schemas/customer/contact";

export type FormErrors = Partial<Record<"name" | "email" | "phone" | "topic" | "message", string[]>>;

export type FormState = {
  success: boolean;
  errors: FormErrors;
};

export const ContactSubmit = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    await dbConnect();
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      topic: formData.get("topic"),
      message: formData.get("message"),
    };

    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as FormErrors,
      };
    }

    await ContactModel.create(parsed.data);

    return { success: true, errors: {} };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      errors: { message: ["Something went wrong. Try again."] },
    };
  }
};