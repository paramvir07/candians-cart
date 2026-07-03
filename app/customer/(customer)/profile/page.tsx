import { Suspense } from "react";
import { Metadata } from "next";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import ProfileServer from "@/components/customer/profile/ProfileServer";
import { AddressCheckLoader } from "@/components/customer/shared/AddressCheckLoader";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <AddressCheckLoader />
      </Suspense>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileServer />
      </Suspense>
    </>
  );
}
