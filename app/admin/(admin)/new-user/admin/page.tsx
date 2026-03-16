import { SignupForm } from "@/components/auth/signup-form";

const page = () => {
    return (

    <div className="flex items-center justify-center p-5">
      <SignupForm userRole="admin" />
    </div>

  )
};

export default page;
