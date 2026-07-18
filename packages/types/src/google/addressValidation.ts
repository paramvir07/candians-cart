interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export async function validateBCAddress(
  address: string,
  city: string,
  postalCode: string,
): Promise<ValidationResult> {
  try {
    const res = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_MAPS_SERVER_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            regionCode: "CA",
            administrativeArea: "BC",
            locality: city,
            postalCode,
            addressLines: [address],
          },
        }),
      },
    );

    if (!res.ok) {
      console.error("Address Validation API error:", await res.text());
      return {
        valid: false,
        reason: "Could not verify address right now. Please try again.",
      };
    }

    const data = await res.json();
    const verdict = data.result?.verdict;
    const resolvedAddr = data.result?.address?.postalAddress;

    if (verdict?.addressComplete === false) {
      return {
        valid: false,
        reason: "Please enter a complete, valid street address.",
      };
    }

    if (resolvedAddr?.administrativeArea !== "BC") {
      return {
        valid: false,
        reason: "We currently only deliver within British Columbia.",
      };
    }

    if (resolvedAddr?.regionCode !== "CA") {
      return { valid: false, reason: "Address must be within Canada." };
    }

    // Guard against someone bypassing the UI and submitting a mismatched city
    const resolvedLocality = (resolvedAddr?.locality ?? "").toLowerCase();
    if (resolvedLocality && resolvedLocality !== city.toLowerCase()) {
      return {
        valid: false,
        reason: "City doesn't match the selected address.",
      };
    }

    return { valid: true };
  } catch (err) {
    console.error("Address validation failed:", err);
    return {
      valid: false,
      reason: "Could not verify address right now. Please try again.",
    };
  }
}
