"use client";

export async function downloadOrderInvoicePDF(order: any) {
  let body: string;

  try {
    body = JSON.stringify(order);
  } catch (err) {
    throw new Error(
      `Order data could not be serialized: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }

  let res: Response;
  try {
    res = await fetch("/api/order-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (err) {
    throw new Error(
      `Request to /api/order-receipt failed: ${
        err instanceof Error ? err.message : "Network error"
      }`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to generate PDF (${res.status}): ${text}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const date = new Date(order.createdAt);
  const safeDate = Number.isNaN(date.getTime())
    ? "unknown-date"
    : new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(date)
        .replaceAll("/", "-");

  const orderId = String(order._id ?? "unknown");
  const filename = `invoice-${orderId.slice(-8).toUpperCase()}-${safeDate}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
