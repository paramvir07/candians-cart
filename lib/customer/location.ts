export const CUSTOMER_CITIES = [
  "Abbotsford",
  "Burnaby",
  "Chilliwack",
  "Delta",
  "Hope",
  "Langley",
  "Mission",
  "Surrey",
  "Vancouver",
] as const;

export type CustomerCity = (typeof CUSTOMER_CITIES)[number];

export const CUSTOMER_PROVINCES = ["BC"] as const;

export type CustomerProvince = (typeof CUSTOMER_PROVINCES)[number];

export const DEFAULT_CUSTOMER_CITY: CustomerCity = "Abbotsford";

export const DEFAULT_CUSTOMER_PROVINCE: CustomerProvince = "BC";
