"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Something went wrong.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-2xl mx-auto mb-4">
            📬
          </div>
          <h1 className="text-xl font-bold text-green-900 mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-gray-500">
            If an account exists for <strong>{email}</strong>, a reset link has
            been sent. It expires in 1 hour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-green-100 p-8">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-2xl mx-auto mb-4">
          🔐
        </div>
        <h1 className="text-2xl font-bold text-green-900 mb-1 text-center">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Remembered it?{" "}
          <a
            href="customer/login"
            className="text-green-600 hover:underline font-medium"
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
