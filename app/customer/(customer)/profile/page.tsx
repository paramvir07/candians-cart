import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const page = async() => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/customer/login');

  const role = session.user.role === "customer";
  console.log({ role });
  return (
    <div>Customer Profile</div>
  )
}

export default page