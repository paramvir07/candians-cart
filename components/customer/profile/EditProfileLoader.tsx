import EditProfileForm from "@/components/customer/profile/EditProfileForm";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function EditProfileLoader() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/customer/login");

  await dbConnect();
  const customerProfile = await Customer.findOne({
    userId: session.user.id,
  }).lean();

  if (!customerProfile) redirect("/customer");

  const mergedUserData = {
    name: customerProfile.name || "",
    email: customerProfile.email || "",
    aptUnit: customerProfile.aptUnit || "",
    address: customerProfile.address || "",
    city: customerProfile.city || "",
    province: customerProfile.province || "",
    postalCode: customerProfile.postalCode ?? "",
    mobile: customerProfile.mobile || "",
  };

  return <EditProfileForm user={mergedUserData} />;
}