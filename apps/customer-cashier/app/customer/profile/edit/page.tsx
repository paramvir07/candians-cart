import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import { EditProfileLoader } from "@canadian-cart/ui/customer/profile/EditProfileLoader";
import { EditProfileSkeleton } from "@canadian-cart/ui/skeletons/EditProfileSkeleton";

const EditProfilePage = () => {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<EditProfileSkeleton />}>
        <EditProfileLoader />
      </Suspense>
    </div>
  );
};

export default EditProfilePage;