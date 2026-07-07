import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import { EditProfileLoader } from "@/components/customer/profile/EditProfileLoader";
import { EditProfileSkeleton } from "@/components/skeletons/EditProfileSkeleton";

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