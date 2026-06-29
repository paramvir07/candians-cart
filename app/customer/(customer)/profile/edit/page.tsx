import Navbar from "@/components/customer/landing/Navbar";
import EditProfileForm from "@/components/customer/profile/EditProfileForm";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Edit page always fetches fresh — no cache
// so the form always reflects latest DB state (e.g. after phone verification)
const EditProfilePage = async () => {
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
    address: customerProfile.address || "",
    city: customerProfile.city || "",
    province: customerProfile.province || "",
    postalCode: customerProfile.postalCode ?? "",
    mobile: customerProfile.mobile || "",
  };

  return (
    <div>
      <Navbar />
      <EditProfileForm user={mergedUserData} />
    </div>
  );
};

export default EditProfilePage;