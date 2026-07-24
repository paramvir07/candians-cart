export type CloverEnvironment = "sandbox" | "production";

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is missing`);
  return value;
};

export const getCloverConfig = () => {
  const environment = (process.env.CLOVER_ENV ?? "sandbox") as CloverEnvironment;

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("CLOVER_ENV must be either 'sandbox' or 'production'");
  }

  const appUrl = required("CLOVER_APP_URL").replace(/\/+$/, "");

  return {
    environment,
    appUrl,
    appId: required("CLOVER_APP_ID"),
    appSecret: required("CLOVER_APP_SECRET"),
    raid: required("CLOVER_RAID"),
    deviceId: required("CLOVER_DEVICE_ID"),
    authorizeBaseUrl:
      environment === "sandbox"
        ? "https://sandbox.dev.clover.com"
        : "https://www.clover.com",
    apiBaseUrl:
      environment === "sandbox"
        ? "https://apisandbox.dev.clover.com"
        : "https://api.clover.com",
    callbackUrl: `${appUrl}/api/clover/callback`,
  } as const;
};
