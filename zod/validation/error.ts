import { ZodError } from "zod";

export const zodErrorResponse = <T>(
  result: { success: true; data: T } | { success: false; error: ZodError },
): string | null => {
  if (result.success) return null;
  const firstError = result.error.issues[0];
  return firstError
    ? `${firstError.path.join(".")}: ${firstError.message}`
    : "Validation Error";
};
