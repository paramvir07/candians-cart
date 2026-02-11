import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

/*
    returns the user session if it exists, otherwise redirects to the login page

    to use session, const Id = session?.user?.id;
*/

export default async function getUserSession() {
    try{
        const session = await auth.api.getSession({
            headers: await headers(),
        });
      
        if(!session){
            redirect("/customer/login");
        }

      return session;

    } catch(error){
        console.log("Error fetching user session:", error);
        redirect("/customer/login");
    }
}