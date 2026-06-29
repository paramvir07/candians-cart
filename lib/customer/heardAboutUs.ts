export const HEARD_ABOUT_US_OPTIONS = [
  {
    label: "Instagram",
    value: "instagram",
  },
  {
    label: "TikTok",
    value: "tiktok",
  },
  {
    label: "Facebook",
    value: "facebook",
  },
  {
    label: "Friend or Family",
    value: "friend_or_family",
  },
  {
    label: "Referred by a Customer",
    value: "refer",
  },
  {
    label: "In-store",
    value: "store",
  },
  {
    label: "Google Search",
    value: "google",
  },
  {
    label: "Candian's Cart Team",
    value: "cc_team",
  },
] as const;

export const HEARD_ABOUT_US_VALUES = HEARD_ABOUT_US_OPTIONS.map(
  (option) => option.value,
) as [string, ...string[]];

export type HeardAboutUs = (typeof HEARD_ABOUT_US_OPTIONS)[number]["value"];
