import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Navbar from "@/components/customer/landing/Navbar";
import EditProfileForm from "@/components/customer/profile/EditProfileForm"; // We will create this next
import Customer from "@/db/models/customer/customer.model";

const EditProfilePage = async () => {
  // 1. Get auth user
  const session = await getUserSession();

  // 2. Get the extended Mongoose profile data
  await dbConnect();
  const customerProfile = await Customer.findOne({
    userId: session.user.id,
  }).lean();

  // Merge the auth name/email with the Mongoose data so the form has everything
  const mergedUserData = {
    name: session.user.name,
    email: session.user.email,
    address: customerProfile?.address || "",
    city: customerProfile?.city || "",
    province: customerProfile?.province || "",
    mobile: customerProfile?.mobile || "",
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4">
        <EditProfileForm user={mergedUserData} />
      </div>
    </div>
  );
};

export default EditProfilePage;
