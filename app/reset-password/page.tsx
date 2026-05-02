import ResetPasswordForm from "@/components/auth/ResetPasswordForm";


export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-700 mb-2">Invalid or expired link</h1>
          <p className="text-sm text-gray-500 mb-6">
            This reset link is no longer valid. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition"
          >
            Request new link
          </a>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}