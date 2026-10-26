export const GENERIC_FORM_ERROR =
  "Something went wrong. Please try again.";

/** PostgreSQL SQLSTATE for `exclusion_constraint_violation`. */
const EXCLUSION_VIOLATION = "23P01";
/** The `Appointment` overlap constraint added by `prisma/migrations/20261026111500_appointment_no_overlap`. */
const SCHEDULE_CONSTRAINT = "Appointment_no_overlap";

type AdapterCause = {
  code?: unknown;
  originalCode?: unknown;
  originalMessage?: unknown;
};

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  meta?: {
    code?: unknown;
    driverAdapterError?: { cause?: AdapterCause };
  };
};

/**
 * True when a rejected write lost a scheduling race against the
 * `Appointment_no_overlap` exclusion constraint — i.e. the slot was taken
 * between the action's own availability check and the insert/restore.
 *
 * The constraint name and SQLSTATE are both checked because Prisma surfaces
 * driver-adapter failures under different codes (`P2039` here); anything else
 * that fails a constraint (foreign key, check, unique) must keep falling
 * through to the generic form error.
 */
export function isScheduleConflict(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const { code, message, meta } = error as ErrorLike;
  const cause = meta?.driverAdapterError?.cause;

  if ([code, meta?.code, cause?.code, cause?.originalCode].includes(EXCLUSION_VIOLATION)) {
    return true;
  }

  return [message, cause?.originalMessage].some(
    (part) => typeof part === "string" && part.includes(SCHEDULE_CONSTRAINT),
  );
}

export function logServerError(scope: string, error: unknown) {
  console.error(`[server:${scope}]`, error);
}

export function logClientError(scope: string, error: unknown) {
  console.error(`[client:${scope}]`, error);
}
