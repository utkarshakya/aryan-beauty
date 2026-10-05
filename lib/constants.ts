export const GRANTABLE_ROLES = ["staff", "customer", "admin"] as const;
export const SERVICE_CATEGORIES = [
  "Hair",
  "Skin",
  "Nails",
  "Makeup",
  "Other",
] as const;
export const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type GrantableRole = (typeof GRANTABLE_ROLES)[number];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type WeekdayName = (typeof WEEKDAY_NAMES)[number];
