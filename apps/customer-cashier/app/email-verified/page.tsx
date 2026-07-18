import EmailVerifiedClient from "@canadian-cart/ui/auth/EmailVerifiedClient";

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <EmailVerifiedClient type={type} />;
}