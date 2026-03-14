import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Navbar from "@/components/customer/landing/Navbar";
import EditProfileForm from "@/components/customer/profile/EditProfileForm";
import Customer from "@/db/models/customer/customer.model";

const EditProfilePage = async () => {
  const session = await getUserSession();

  await dbConnect();
  const customerProfile = await Customer.findOne({
    userId: session.user.id,
  }).lean();

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
      <EditProfileForm user={mergedUserData} />
    </div>
  );
};

export default EditProfilePage;