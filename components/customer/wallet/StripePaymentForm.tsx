"use client";
import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
    });

    if (result.error) setError(result.error.message || "Payment failed");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading}>
        {loading ? "Processing…" : "Pay"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}