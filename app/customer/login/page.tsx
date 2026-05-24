// import { LoginForm } from "@/components/auth/login-form";
// import { LoginCarousel } from "@/components/customer/login/LoginCarousel";
// import { auth } from "@/lib/auth/auth";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";

// export const metadata = {
//   title: "Login",
// };

// export default async function Page() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (session) redirect("/customer");

//   return (
//     // h-dvh + overflow-hidden: locks the page to viewport on all screen sizes
//     <div className="h-dvh w-full overflow-hidden flex items-center justify-center md:p-8 relative bg-background md:bg-muted/30">

//       {/* MOBILE: LoginForm owns the full h-dvh layout, nothing to do here */}
//       <div className="w-full h-full md:hidden">
//         <LoginForm userRole="customer" className="w-full h-full" />
//       </div>

//       {/* DESKTOP: carousel + form card, fixed height card */}
//       <div className="hidden md:flex relative z-10 w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden">
//         <div className="w-[50%] shrink-0 p-2.5">
//           <div className="h-full min-h-[575px]">
//             <LoginCarousel />
//           </div>
//         </div>
//         <div className="flex-1 flex items-center justify-center px-14 py-12 bg-card">
//           <LoginForm userRole="customer" className="w-full max-w-[380px]" />
//         </div>
//       </div>
//     </div>
//   );
// }

import { LoginForm } from "@/components/auth/login-form";
import { LoginCarousel } from "@/components/customer/login/LoginCarousel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/customer");

return (
  <div className="min-h-screen w-full flex items-center justify-center lg:p-8 relative overflow-hidden ">
    {/* desktop bg */}
    <div className="absolute inset-0 hidden lg:block bg-muted/30 z-0" />

    <div className="relative z-10 w-full lg:max-w-5xl lg:flex shadow-2xl rounded-2xl">
      <div className="hidden lg:block w-[50%] shrink-0 p-2.5">
        <div className="h-full min-h-[575px]">
          <LoginCarousel />
        </div>
      </div>
      <div className="flex-1 lg:flex lg:items-center lg:justify-center lg:px-14 lg:py-12">
        <LoginForm userRole="customer" className="w-full lg:max-w-[380px]" />
      </div>
    </div>
  </div>
);
}