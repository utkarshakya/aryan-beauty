export const GRANTABLE_ROLES = ["staff", "customer", "admin"] as const;
export const SERVICE_CATEGORIES = [
  "Hair",
  "Skin",
  "Nails",
  "Makeup",
  "Other",
] as const;

/**
 * ISO weekday order — `0 = Monday` … `6 = Sunday`, the same convention as
 * `(getDay() + 6) % 7`, the settings form's `closedWeekdays` checkboxes, and
 * the `closedWeekdays` column. Indexed by `getAvailableSlots`, never by the
 * raw JavaScript `getUTCDay()` value (which is Sunday-first and used to shift
 * every closed day by one).
 */
export const WEEKDAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type GrantableRole = (typeof GRANTABLE_ROLES)[number];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type WeekdayName = (typeof WEEKDAY_NAMES)[number];
