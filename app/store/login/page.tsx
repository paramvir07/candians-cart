import { LoginForm } from "@/components/auth/login-form";

// login user name and pass -: paramvirsingh2540@gmail.com, param@123
// actions/aut/auth.action.ts

// For store signup, got to actions/auth/storeSignup.actiond.ts

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm role="store" />
      </div>
    </div>
  );
}
