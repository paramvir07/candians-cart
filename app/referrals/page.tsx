import FooterWrapper from "@/components/landing/FooterWrapper"
import NavbarWrapper from "@/components/landing/NavbarWrapper"
import ReferralsLanding from "@/components/landing/ReferralsLanding"
import { getRandom10Referrals } from "@/actions/customer/ReferralRequest.Action"
import { Suspense } from "react"
import {  isLoggedIn } from "@/actions/auth/getUserSession.actions"
import { redirect } from "next/navigation"

function MemberListSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-col gap-3">
        <div className="w-28 h-3 rounded bg-muted animate-pulse" />
        <div className="w-64 h-8 rounded-lg bg-muted animate-pulse" />
        <div className="w-full h-4 rounded bg-muted animate-pulse" />
        <div className="w-3/4 h-4 rounded bg-muted animate-pulse" />
      </div>
      {/* Identity strip skeleton */}
      <div className="h-14 rounded-xl border border-border bg-muted animate-pulse mb-6" />
      {/* Cards skeleton */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 h-4 rounded-md bg-muted" />
            <div className="w-24 h-8 rounded-lg bg-muted flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

async function MemberListServer() {
  const LoggedIn = await isLoggedIn();
  if (LoggedIn) redirect('/customer')
  const result = await getRandom10Referrals()
  const members = result.success && result.data ? result.data : []
  return <ReferralsLanding initialMembers={members} />
}

const page = () => {
  return (
    <>
      <NavbarWrapper />
      <Suspense fallback={<MemberListSkeleton />}>
        <MemberListServer />
      </Suspense>
      <FooterWrapper />
      </>
  )
}

export default page