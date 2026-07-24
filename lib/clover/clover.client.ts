import { getCloverConfig } from "./clover.config";
import { getValidCloverAccessToken } from "./clover-token.service";

export interface CloverCardTransaction {
  authCode?: string;
  cardType?: string;
  entryType?: string;
  last4?: string;
  referenceId?: string;
  state?: string;
  transactionNo?: string;
  type?: string;
}

export interface CloverPayment {
  id?: string;
  amount?: number;
  externalPaymentId?: string;
  result?: string;
  offline?: boolean;
  cardTransaction?: CloverCardTransaction;
}

export interface CloverPaymentResponse {
  payment?: CloverPayment;
  code?: string;
  message?: string;
  requestId?: string;
  requestType?: string;
  type?: string;
}

export class CloverRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "CloverRequestError";
  }
}

const parseResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
};

const getHeaders = async (idempotencyKey?: string): Promise<HeadersInit> => {
  const config = getCloverConfig();
  const accessToken = await getValidCloverAccessToken();

  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": "CanadiansCart/1.0 (Next.js POS)",
    "X-Clover-Device-Id": config.deviceId,
    "X-POS-Id": config.raid,
    "X-Clover-Timeout": "75",
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
  };
};

export const startCloverPayment = async ({
  amount,
  externalPaymentId,
}: {
  amount: number;
  externalPaymentId: string;
}): Promise<CloverPaymentResponse> => {
  const config = getCloverConfig();
  const response = await fetch(`${config.apiBaseUrl}/connect/v1/payments`, {
    method: "POST",
    headers: await getHeaders(externalPaymentId),
    body: JSON.stringify({ amount, externalPaymentId }),
    cache: "no-store",
    signal: AbortSignal.timeout(80_000),
  });

  const payload = (await parseResponse(response)) as CloverPaymentResponse;

  if (!response.ok || response.status === 209) {
    throw new CloverRequestError(
      payload.message || `Clover payment failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload;
};

export const getCloverPaymentByExternalId = async (
  externalPaymentId: string,
): Promise<CloverPaymentResponse> => {
  const config = getCloverConfig();
  const response = await fetch(
    `${config.apiBaseUrl}/connect/v1/payments/external/${encodeURIComponent(externalPaymentId)}`,
    {
      method: "GET",
      headers: await getHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    },
  );

  const payload = (await parseResponse(response)) as CloverPaymentResponse;

  if (!response.ok || response.status === 209) {
    throw new CloverRequestError(
      payload.message || `Unable to retrieve Clover payment (${response.status})`,
      response.status,
      payload,
    );
  }

  return payload;
};

export const pingCloverDevice = async (): Promise<unknown> => {
  const config = getCloverConfig();
  const response = await fetch(`${config.apiBaseUrl}/connect/v1/device/ping`, {
    method: "POST",
    headers: await getHeaders(),
    body: "{}",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const payload = await parseResponse(response);
  if (!response.ok || response.status === 209) {
    throw new CloverRequestError(
      `Unable to reach Clover device (${response.status})`,
      response.status,
      payload,
    );
  }

  return payload;
};

export const showCloverWelcomeScreen = async (): Promise<void> => {
  try {
    const config = getCloverConfig();
    await fetch(`${config.apiBaseUrl}/connect/v1/device/welcome`, {
      method: "POST",
      headers: await getHeaders(),
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.warn("Unable to restore Clover welcome screen:", error);
  }
};

export const isSuccessfulCloverPayment = (
  response: CloverPaymentResponse,
  expectedAmount: number,
): response is CloverPaymentResponse & { payment: CloverPayment } => {
  const payment = response.payment;

  return Boolean(
    payment &&
      payment.id &&
      payment.amount === expectedAmount &&
      payment.result === "SUCCESS" &&
      payment.cardTransaction?.state === "CLOSED" &&
      payment.cardTransaction?.type === "AUTH",
  );
};
