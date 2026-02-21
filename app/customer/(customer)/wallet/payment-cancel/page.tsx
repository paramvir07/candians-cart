// app/payment-cancel/page.tsx
import { verifyStripeCancelSession } from "@/actions/customer/verifyStripeSession.action"
import PaymentFailedClient from "@/components/customer/wallet/PaymentFailedClient"
import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function PaymentCancelPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect("/customer/wallet")
  }

  const result = await verifyStripeCancelSession(session_id)

  if (!result.valid) {
    redirect("/customer/wallet")
  }

  return <PaymentFailedClient />
}