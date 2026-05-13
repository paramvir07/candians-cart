import { Suspense } from "react";
import { Metadata } from "next";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import ProfileServer from "@/components/customer/profile/ProfileServer";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileServer />
    </Suspense>
  );
}