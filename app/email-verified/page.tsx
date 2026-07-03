import EmailVerifiedClient from "@/components/auth/EmailVerifiedClient";


export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <EmailVerifiedClient type={type} />;
}