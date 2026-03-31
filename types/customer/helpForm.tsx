export type Field = "email" | "subject" | "message" | "category";

export type FormErrors = Partial<Record<Field, string[]>>;

export type FormState = {
  success: boolean;
  errors: FormErrors;
};