import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

/**
 * Fetches the authenticated user's session on the server.
 *
 * Uses request headers to validate the session via `auth.api.getSession`.
 *
 * Behavior:
 * - Returns the session object if authenticated
 * - Redirects to `/customer/login` if no session exists
 * - Redirects on any unexpected error
 *
 * ⚠ This function never returns `null`.
 * It either returns a valid session or triggers a redirect.
 *
 * Usage:
 * ```ts
 * const session = await getUserSession();
 * const userId = session.user.id;
 * ```
 *
 * @returns Promise<Session> The authenticated session
 * @throws RedirectError (Next.js redirect)
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