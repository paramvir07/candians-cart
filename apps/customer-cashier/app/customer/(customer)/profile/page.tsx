import { Suspense } from "react";
import { Metadata } from "next";
import ProfileSkeleton from "@canadian-cart/ui/skeletons/ProfileSkeleton";
import ProfileServer from "@canadian-cart/ui/customer/profile/ProfileServer";
import { AddressCheckLoader } from "@canadian-cart/ui/customer/shared/AddressCheckLoader";

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
