import { z } from "zod";

export const createPublicNotificationSchema = z.object({
  title: z.string().trim().min(1, "Atleast 1 character required in title"),
  message: z.string().trim().min(1, "Atleast 1 character required in title"),
  type: z.enum(
    ["GLOBAL", "PRIVATE"],
    "Type should either be global or private",
  ),
});
