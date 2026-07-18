import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cache } from "react";

export const getUserSession= cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/customer/login");
    }

    return session;
  } catch (error) {
    if(isRedirectError(error)){
      throw error
    }
    console.log("Error fetching user session:", error);
    redirect("/customer/login");
  }
})

export const isLoggedIn = cache(async ()=>{
  try{
    let isLoggedIn = false;
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if(!session) return isLoggedIn;
    isLoggedIn = true;
    return isLoggedIn;
  }catch(err){
    console.log("Error fetching user session:", err);
  }
})
