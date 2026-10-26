import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireOwnerAdmin: vi.fn(async () => "u-admin"),
}));
vi.mock("@/lib/auth", () => authMock);

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => cacheMock);

const dbBusinessMock = vi.hoisted(() => ({
  getBusinessSettingsOrCreate: vi.fn(),
  getBusinessSettingsForAvailability: vi.fn(),
  getBusinessSettingsForDisplay: vi.fn(),
  updateBusinessSettings: vi.fn(),
}));
vi.mock("@/lib/db/business", () => dbBusinessMock);

import { updateBusinessSettingsAction } from "@/app/actions/business";

const VALID_OPENING_HOURS = {
  monday: { open: "09:00", close: "18:00" },
  tuesday: { open: "09:00", close: "18:00" },
  wednesday: { open: "09:00", close: "18:00" },
  thursday: { open: "09:00", close: "18:00" },
  friday: { open: "09:00", close: "18:00" },
  saturday: { open: "10:00", close: "16:00" },
  sunday: { open: "10:00", close: "14:00" },
};

function validFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("name", "Aryan Beauty");
  formData.set("phone", "+91 98765 43210");
  formData.set("phoneDisplay", "+91 98765 43210");
  formData.set("phoneHref", "tel:+919876543210");
  formData.set("address", "Shop 12, Main Market Road");
  formData.set("addressLine2", "Sector 4");
  formData.set("tagline", "Your neighbourhood beauty parlour");
  formData.set("description", "Book your visit online in under a minute.");
  formData.set("timeZone", "Asia/Kolkata");
  formData.set("openingHours", JSON.stringify(VALID_OPENING_HOURS));
  formData.set("closedWeekdays", JSON.stringify([0, 6]));
  formData.set(
    "closures",
    JSON.stringify([{ date: "2026-12-25", reason: "Christmas" }]),
  );
  formData.set("slotIntervalMin", "30");
  formData.set("minBookingNoticeMin", "60");
  formData.set("cancellationCutoffMin", "120");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

function errorsOf(result: { errors?: Record<string, string> }) {
  return result.errors ?? {};
}

beforeEach(() => {
  vi.clearAllMocks();
  dbBusinessMock.updateBusinessSettings.mockResolvedValue({});
});

describe("updateBusinessSettingsAction: valid input", () => {
  it("saves all fifteen fields, including the five marketing fields the form submits", async () => {
    const result = await updateBusinessSettingsAction(
      { errors: {} },
      validFormData(),
    );

    expect(result).toEqual({ success: "Business settings saved successfully" });
    expect(dbBusinessMock.updateBusinessSettings).toHaveBeenCalledTimes(1);
    expect(dbBusinessMock.updateBusinessSettings).toHaveBeenCalledWith({
      name: "Aryan Beauty",
      phone: "+91 98765 43210",
      phoneDisplay: "+91 98765 43210",
      phoneHref: "tel:+919876543210",
      address: "Shop 12, Main Market Road",
      addressLine2: "Sector 4",
      tagline: "Your neighbourhood beauty parlour",
      description: "Book your visit online in under a minute.",
      timeZone: "Asia/Kolkata",
      openingHours: VALID_OPENING_HOURS,
      closedWeekdays: [0, 6],
      closures: [{ date: "2026-12-25", reason: "Christmas" }],
      slotIntervalMin: 30,
      minBookingNoticeMin: 60,
      cancellationCutoffMin: 120,
    });
    expect(cacheMock.revalidatePath).toHaveBeenCalled();
  });

  it("omits absent marketing fields instead of overwriting them with an empty string", async () => {
    const formData = validFormData();
    for (const key of [
      "phoneDisplay",
      "phoneHref",
      "addressLine2",
      "tagline",
      "description",
    ]) {
      formData.delete(key);
    }

    const result = await updateBusinessSettingsAction({ errors: {} }, formData);

    expect(result.success).toBeTruthy();
    const payload = dbBusinessMock.updateBusinessSettings.mock.calls[0][0];
    for (const key of [
      "phoneDisplay",
      "phoneHref",
      "addressLine2",
      "tagline",
      "description",
    ]) {
      expect(payload).not.toHaveProperty(key);
    }
    expect(payload.name).toBe("Aryan Beauty");
  });

  it.each([
    ["UTC"],
    ["America/New_York"],
    ["Europe/London"],
    ["Australia/Sydney"],
  ])("accepts the valid time zone %s", async (timeZone) => {
    const result = await updateBusinessSettingsAction(
      { errors: {} },
      validFormData({ timeZone }),
    );

    expect(result.success).toBeTruthy();
    expect(dbBusinessMock.updateBusinessSettings).toHaveBeenCalledTimes(1);
  });

  it("accepts boundary values for every numeric field", async () => {
    const formData = validFormData({
      slotIntervalMin: "5",
      minBookingNoticeMin: "0",
      cancellationCutoffMin: "0",
    });
    expect(
      (await updateBusinessSettingsAction({ errors: {} }, formData)).success,
    ).toBeTruthy();

    const upper = validFormData({
      slotIntervalMin: "120",
      minBookingNoticeMin: "10080",
      cancellationCutoffMin: "10080",
    });
    expect(
      (await updateBusinessSettingsAction({ errors: {} }, upper)).success,
    ).toBeTruthy();
    expect(dbBusinessMock.updateBusinessSettings).toHaveBeenCalledTimes(2);
  });
});

describe("updateBusinessSettingsAction: rejected input never reaches the database", () => {
  async function expectRejected(
    formData: FormData,
    field: string,
  ): Promise<void> {
    const result = await updateBusinessSettingsAction({ errors: {} }, formData);
    expect(errorsOf(result)[field]).toBeTruthy();
    expect(result.success).toBeUndefined();
    expect(dbBusinessMock.updateBusinessSettings).not.toHaveBeenCalled();
  }

  it.each([
    ["a malformed opening-hours JSON blob", { openingHours: "{oops" }],
    ["a non-object opening-hours value", { openingHours: '"09:00-18:00"' }],
    ["an array as opening hours", { openingHours: "[]" }],
    ["a null opening-hours value", { openingHours: "null" }],
    ["a missing opening-hours field", { openingHours: null }],
    ["a non-weekday opening-hours key", {
      openingHours: JSON.stringify({ funday: { open: "09:00", close: "18:00" } }),
    }],
    ["a non-HH:MM opening time", {
      openingHours: JSON.stringify({ monday: { open: "9:00", close: "18:00" } }),
    }],
    ["an out-of-range closing time", {
      openingHours: JSON.stringify({ monday: { open: "09:00", close: "24:00" } }),
    }],
    ["a closing time at or before the opening time", {
      openingHours: JSON.stringify({ monday: { open: "18:00", close: "09:00" } }),
    }],
    ["a closing time equal to the opening time", {
      openingHours: JSON.stringify({ monday: { open: "09:00", close: "09:00" } }),
    }],
  ])("rejects %s under openingHours", async (_label, overrides) => {
    const formData = validFormData(overrides as Record<string, string>);
    if ((overrides as Record<string, string | null>).openingHours === null) {
      formData.delete("openingHours");
    }
    await expectRejected(formData, "openingHours");
  });

  it.each([
    ["malformed JSON", "not json"],
    ["a non-array value", '"monday"'],
    ["an out-of-range weekday", "[7]"],
    ["a negative weekday", "[-1]"],
    ["a fractional weekday", "[3.5]"],
    ["a numeric weekday outside a list check", '3'],
    ["a string-typed weekday", '["0"]'],
  ])("rejects closedWeekdays of %s", async (_label, raw) => {
    await expectRejected(validFormData({ closedWeekdays: raw }), "closedWeekdays");
  });

  it("rejects a missing closedWeekdays field", async () => {
    const formData = validFormData();
    formData.delete("closedWeekdays");
    await expectRejected(formData, "closedWeekdays");
  });

  it.each([
    ["malformed JSON", "nope"],
    ["a non-array value", '{"date":"2026-12-25"}'],
    ["a calendar-invalid date", '[{"date":"2026-02-31","reason":"Holiday"}]'],
    ["an out-of-range month", '[{"date":"2026-13-01","reason":"Holiday"}]'],
    ["a non-ISO date", '[{"date":"25/12/2026","reason":"Holiday"}]'],
    ["a missing reason", '[{"date":"2026-12-25"}]'],
    ["an empty reason", '[{"date":"2026-12-25","reason":"   "}]'],
    ["an over-long reason", '[{"date":"2026-12-25","reason":"' + "x".repeat(201) + '"}]'],
  ])("rejects closures with %s", async (_label, raw) => {
    await expectRejected(validFormData({ closures: raw }), "closures");
  });

  it("rejects a missing closures field", async () => {
    const formData = validFormData();
    formData.delete("closures");
    await expectRejected(formData, "closures");
  });

  it.each([
    ["an unknown zone", "Mars/Olympus"],
    ["a bare zone name", "Kolkata"],
    ["an empty value", ""],
    ["a nonsense identifier", "not a zone"],
  ])("rejects the time zone %s", async (_label, timeZone) => {
    await expectRejected(validFormData({ timeZone }), "timeZone");
  });

  it("rejects a missing time zone", async () => {
    const formData = validFormData();
    formData.delete("timeZone");
    await expectRejected(formData, "timeZone");
  });

  it.each([
    ["slotIntervalMin", "abc"],
    ["slotIntervalMin", ""],
    ["slotIntervalMin", "4"],
    ["slotIntervalMin", "121"],
    ["slotIntervalMin", "30.5"],
    ["minBookingNoticeMin", "abc"],
    ["minBookingNoticeMin", "-1"],
    ["minBookingNoticeMin", "10081"],
    ["cancellationCutoffMin", "abc"],
    ["cancellationCutoffMin", "-1"],
    ["cancellationCutoffMin", "10081"],
  ])("rejects %s = %s", async (field, value) => {
    const formData = validFormData({ [field]: value });
    if (value === "") formData.delete(field);
    await expectRejected(formData, field);
  });

  it.each([
    ["name", ""],
    ["name", "x".repeat(101)],
    ["phone", "x".repeat(31)],
    ["address", "x".repeat(201)],
    ["phoneDisplay", "x".repeat(51)],
    ["phoneHref", "x".repeat(101)],
    ["addressLine2", "x".repeat(201)],
    ["tagline", "x".repeat(151)],
    ["description", "x".repeat(1001)],
  ])("rejects %s over its length bound", async (field, value) => {
    await expectRejected(validFormData({ [field]: value }), field);
  });

  it("rejects a missing name", async () => {
    const formData = validFormData();
    formData.delete("name");
    await expectRejected(formData, "name");
  });
});
