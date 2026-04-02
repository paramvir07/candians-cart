import Navbar from "@/components/customer/landing/Navbar";
import EditProfileForm from "@/components/customer/profile/EditProfileForm";
import { getCustomerProfileAction } from "@/actions/customer/User.action";

const EditProfilePage = async () => {
  const customerProfile = await getCustomerProfileAction()


  const mergedUserData = {
    name: customerProfile?.name || "",
    email: customerProfile?.email || "",
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