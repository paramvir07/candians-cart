import { Suspense } from "react";
import { getUser } from "@/actions/customer/User.action";
import HelpForm from "@/components/customer/help/HelpForm";
import { Metadata } from "next";
import HelpFormSkeleton from "@/components/skeletons/HelpFormSkeleton";

export const metadata: Metadata = {
  title: "Help",
};

async function HelpLoader() {
  const User = await getUser();
  const email = User?.email ?? "";
  return <HelpForm userEmail={email} />;
}

export default function HelpPage() {
  return (
    <Suspense fallback={<HelpFormSkeleton />}>
      <HelpLoader />
    </Suspense>
  );
}