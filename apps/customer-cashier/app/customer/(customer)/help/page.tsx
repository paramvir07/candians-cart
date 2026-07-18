import { Suspense } from "react";
import { getUser } from "@canadian-cart/actions/customer/User.action";
import HelpForm from "@canadian-cart/ui/customer/help/HelpForm";
import { Metadata } from "next";
import HelpFormSkeleton from "@canadian-cart/ui/skeletons/HelpFormSkeleton";

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