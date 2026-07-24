import { auth } from "@/lib/auth/auth";
import { dbConnect } from "@/db/dbConnect";
import { Cashier } from "@/db/models/cashier/cashier.model";

export interface TopUpActor {
  authUserId: string;
  userId: string;
  userRole: "admin" | "cashier";
}

export const resolveTopUpActor = async (user: {
  id: string;
  role?: string | null;
}): Promise<TopUpActor> => {
  await dbConnect();

  if (user.role === "admin") {
    return {
      authUserId: user.id,
      userId: user.id,
      userRole: "admin",
    };
  }

  if (user.role === "cashier") {
    const cashier = await Cashier.findOne({ userId: user.id })
      .select("_id")
      .lean();

    if (!cashier) throw new Error("Cashier record not found");

    return {
      authUserId: user.id,
      userId: String(cashier._id),
      userRole: "cashier",
    };
  }

  throw new Error("Only admins and cashiers can perform wallet top-ups");
};

export const getTopUpActorFromRequest = async (
  request: Request,
): Promise<TopUpActor | null> => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  return resolveTopUpActor({
    id: session.user.id,
    role: (session.user as { role?: string }).role,
  });
};
