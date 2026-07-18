import { redirect } from "next/navigation"
import { verifyStripeSession } from "@canadian-cart/actions/customer/verifyStripeSession.action"
import PaymentSuccessClient from "@canadian-cart/ui/customer/wallet/PaymentSucessClient"

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect("/customer/wallet")
  }

  const result = await verifyStripeSession(session_id)

  if (!result.valid) {
    redirect("/customer/wallet")
  }

  return <PaymentSuccessClient />
}