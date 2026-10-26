import type { BusinessSettingsFormData } from "@/lib/db/business";

/**
 * Server-side validation for the business-settings form. Hand-rolled because
 * the project forbids new runtime dependencies; `app/actions/business.ts` is
 * the only caller for now, but the parser is pure (no FormData side effects,
 * no prisma, no Next APIs) so a future API layer can reuse it directly.
 *
 * Rules that encode product behaviour, not just types:
 * - `closedWeekdays` uses the ISO convention shared with the settings form
 *   and `getAvailableSlots`: 0 = Monday … 6 = Sunday.
 * - Opening hours are same-day only (`open < close`); no overnight hours.
 * - Malformed input is reported as a field error — it is never silently
 *   replaced by `{}`/`[]` defaults, and a missing field is never coerced to
 *   `0` or `""`.
 */

export type BusinessSettingsFormParse =
  | { ok: true; data: Partial<BusinessSettingsFormData> }
  | { ok: false; errors: Record<string, string> };

const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_LENGTHS = {
  phone: 30,
  phoneDisplay: 50,
  phoneHref: 100,
  address: 200,
  addressLine2: 200,
  tagline: 150,
  description: 1000,
  closureReason: 200,
} as const;

const NOTICE_LIMIT_MIN = 10080; // 7 days

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function isValidCalendarDate(date: string) {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === date;
}

function readBoundedString(
  formData: FormData,
  key: string,
  max: number,
  errors: Record<string, string>,
): string | null {
  const value = String(formData.get(key) ?? "").trim();
  if (value.length > max) {
    errors[key] = `Must be ${max} characters or fewer`;
    return null;
  }
  return value;
}

/**
 * Strict integer parsing from the raw form value. `Number()` is deliberately
 * not used: `Number("")` and `Number(null)` are `0`, which used to sail
 * through the `>= 0` bounds for the notice and cutoff fields.
 */
function readBoundedInteger(
  formData: FormData,
  key: string,
  min: number,
  max: number,
  message: string,
  errors: Record<string, string>,
): number | null {
  const raw = formData.get(key);
  if (raw === null) {
    errors[key] = message;
    return null;
  }
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) {
    errors[key] = message;
    return null;
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    errors[key] = message;
    return null;
  }
  return value;
}

const INVALID = Symbol("invalid-json-field");

function parseJsonField(
  formData: FormData,
  key: string,
  errors: Record<string, string>,
): unknown {
  const raw = formData.get(key);
  if (raw === null) {
    errors[key] = `${key} is required`;
    return INVALID;
  }
  let value: unknown;
  try {
    value = JSON.parse(String(raw));
  } catch {
    errors[key] = `${key} could not be read — it must be valid JSON`;
    return INVALID;
  }
  if (value === null) {
    errors[key] = `${key} must not be null`;
    return INVALID;
  }
  return value;
}

function parseOpeningHours(
  formData: FormData,
  errors: Record<string, string>,
): Partial<BusinessSettingsFormData>["openingHours"] | null {
  const parsed = parseJsonField(formData, "openingHours", errors);
  if (parsed === INVALID) return null;

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    errors.openingHours = "Opening hours must be an object keyed by weekday";
    return null;
  }

  const result: Record<string, { open: string; close: string }> = {};
  for (const [day, value] of Object.entries(parsed)) {
    if (!(WEEKDAY_KEYS as readonly string[]).includes(day)) {
      errors.openingHours = `"${day}" is not a weekday`;
      return null;
    }
    if (typeof value !== "object" || value === null) {
      errors.openingHours = `Opening hours for ${day} are invalid`;
      return null;
    }
    const { open, close } = value as { open?: unknown; close?: unknown };
    if (
      typeof open !== "string" ||
      typeof close !== "string" ||
      !TIME_PATTERN.test(open) ||
      !TIME_PATTERN.test(close)
    ) {
      errors.openingHours = `Opening hours for ${day} must use 24-hour HH:MM times`;
      return null;
    }
    if (open >= close) {
      errors.openingHours = `Closing time for ${day} must be after the opening time`;
      return null;
    }
    result[day] = { open, close };
  }
  return result;
}

function parseClosedWeekdays(
  formData: FormData,
  errors: Record<string, string>,
): number[] | null {
  const parsed = parseJsonField(formData, "closedWeekdays", errors);
  if (parsed === INVALID) return null;

  if (!Array.isArray(parsed)) {
    errors.closedWeekdays = "Closed weekdays must be a list of weekday numbers";
    return null;
  }
  for (const entry of parsed) {
    if (!Number.isInteger(entry) || (entry as number) < 0 || (entry as number) > 6) {
      errors.closedWeekdays =
        "Closed weekdays must be whole numbers from 0 (Monday) to 6 (Sunday)";
      return null;
    }
  }
  return parsed as number[];
}

function parseClosures(
  formData: FormData,
  errors: Record<string, string>,
): Partial<BusinessSettingsFormData>["closures"] | null {
  const parsed = parseJsonField(formData, "closures", errors);
  if (parsed === INVALID) return null;

  if (!Array.isArray(parsed)) {
    errors.closures = "Closures must be a list of dates";
    return null;
  }
  const result: Array<{ date: string; reason: string }> = [];
  for (const [index, entry] of parsed.entries()) {
    const label = `Closure ${index + 1}`;
    if (typeof entry !== "object" || entry === null) {
      errors.closures = `${label} is invalid`;
      return null;
    }
    const { date, reason } = entry as { date?: unknown; reason?: unknown };
    if (typeof date !== "string" || !isValidCalendarDate(date)) {
      errors.closures = `${label} must use a real calendar date (YYYY-MM-DD)`;
      return null;
    }
    if (typeof reason !== "string" || !reason.trim()) {
      errors.closures = `${label} needs a reason`;
      return null;
    }
    if (reason.trim().length > MAX_LENGTHS.closureReason) {
      errors.closures = `${label} reason must be ${MAX_LENGTHS.closureReason} characters or fewer`;
      return null;
    }
    result.push({ date, reason: reason.trim() });
  }
  return result;
}

export function parseBusinessSettingsForm(
  formData: FormData,
): BusinessSettingsFormParse {
  const errors: Record<string, string> = {};
  const data: Partial<BusinessSettingsFormData> = {};

  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 100) {
    errors.name = "Enter a business name (max 100 chars)";
  } else {
    data.name = name;
  }

  const phone = readBoundedString(formData, "phone", MAX_LENGTHS.phone, errors);
  if (phone !== null) data.phone = phone;

  const address = readBoundedString(
    formData,
    "address",
    MAX_LENGTHS.address,
    errors,
  );
  if (address !== null) data.address = address;

  const timeZoneRaw = formData.get("timeZone");
  if (timeZoneRaw === null || !String(timeZoneRaw).trim()) {
    errors.timeZone = "Choose a valid time zone";
  } else {
    const timeZone = String(timeZoneRaw).trim();
    if (!isValidTimeZone(timeZone)) {
      errors.timeZone = "Choose a valid time zone";
    } else {
      data.timeZone = timeZone;
    }
  }

  const openingHours = parseOpeningHours(formData, errors);
  if (openingHours !== null) data.openingHours = openingHours;

  const closedWeekdays = parseClosedWeekdays(formData, errors);
  if (closedWeekdays !== null) data.closedWeekdays = closedWeekdays;

  const closures = parseClosures(formData, errors);
  if (closures !== null) data.closures = closures;

  const slotIntervalMin = readBoundedInteger(
    formData,
    "slotIntervalMin",
    5,
    120,
    "Enter a valid slot interval (5-120 minutes)",
    errors,
  );
  if (slotIntervalMin !== null) data.slotIntervalMin = slotIntervalMin;

  const minBookingNoticeMin = readBoundedInteger(
    formData,
    "minBookingNoticeMin",
    0,
    NOTICE_LIMIT_MIN,
    `Enter a valid minimum booking notice (0-${NOTICE_LIMIT_MIN} minutes)`,
    errors,
  );
  if (minBookingNoticeMin !== null) data.minBookingNoticeMin = minBookingNoticeMin;

  const cancellationCutoffMin = readBoundedInteger(
    formData,
    "cancellationCutoffMin",
    0,
    NOTICE_LIMIT_MIN,
    `Enter a valid cancellation cutoff (0-${NOTICE_LIMIT_MIN} minutes)`,
    errors,
  );
  if (cancellationCutoffMin !== null) data.cancellationCutoffMin = cancellationCutoffMin;

  // Optional marketing fields: absent from the FormData means "leave the
  // stored value alone", never "clear it". The form always sends them, so in
  // practice they are validated and written on every save.
  const marketingFields: Array<[keyof BusinessSettingsFormData, number]> = [
    ["phoneDisplay", MAX_LENGTHS.phoneDisplay],
    ["phoneHref", MAX_LENGTHS.phoneHref],
    ["addressLine2", MAX_LENGTHS.addressLine2],
    ["tagline", MAX_LENGTHS.tagline],
    ["description", MAX_LENGTHS.description],
  ];
  for (const [key, max] of marketingFields) {
    const raw = formData.get(key);
    if (raw === null) continue;
    const value = String(raw).trim();
    if (value.length > max) {
      errors[key] = `Must be ${max} characters or fewer`;
      continue;
    }
    (data as Record<string, unknown>)[key] = value;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}
