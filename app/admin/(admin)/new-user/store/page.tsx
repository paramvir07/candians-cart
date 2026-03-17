import { SignupForm } from "@/components/auth/signup-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const page = () => {
  return (
    <>
      <div className="lg:ml-50">
        <Link
          href={`/admin/new-user`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>
      <div className="flex items-center justify-center p-5">
        <SignupForm userRole="store" />
      </div>
    </>
  );
};

export default page;
