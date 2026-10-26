import { describe, expect, it } from "vitest";
import { GENERIC_FORM_ERROR, isScheduleConflict } from "@/lib/errors";

/** Shape Prisma 7 raises through the pg driver adapter for `Appointment_no_overlap`. */
function exclusionViolation() {
  return {
    name: "PrismaClientKnownRequestError",
    code: "P2039",
    message:
      "Database error. Code: `23P01`. Message: `conflicting key value violates exclusion constraint \"Appointment_no_overlap\"`",
    meta: {
      modelName: "Appointment",
      driverAdapterError: {
        name: "DriverAdapterError",
        cause: {
          kind: "postgres",
          code: "23P01",
          originalCode: "23P01",
          originalMessage:
            'conflicting key value violates exclusion constraint "Appointment_no_overlap"',
        },
      },
    },
  };
}

describe("isScheduleConflict", () => {
  it("recognises the exclusion violation the race loser raises", () => {
    expect(isScheduleConflict(exclusionViolation())).toBe(true);
  });

  it("recognises the constraint by name alone", () => {
    expect(
      isScheduleConflict(
        new Error('constraint "Appointment_no_overlap" of relation "Appointment"'),
      ),
    ).toBe(true);
  });

  it("stays false for anything that is not an object", () => {
    expect(isScheduleConflict(null)).toBe(false);
    expect(isScheduleConflict(undefined)).toBe(false);
    expect(isScheduleConflict("boom")).toBe(false);
  });

  it.each([
    ["a plain error", new Error(GENERIC_FORM_ERROR)],
    ["a unique violation", { code: "P2002", meta: { code: "23505" } }],
    ["a foreign key violation", { code: "P2003", meta: { code: "23503" } }],
    ["a check violation", { code: "P2004", meta: { code: "23514" } }],
    ["an unrelated driver error", { code: "P2010", message: "db call failed" }],
  ])("stays false for %s", (_label, error) => {
    expect(isScheduleConflict(error)).toBe(false);
  });
});
