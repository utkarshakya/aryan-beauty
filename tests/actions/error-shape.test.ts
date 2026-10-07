import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireActiveUser: vi.fn(async () => "u-customer"),
  requireAdmin: vi.fn(async () => "u-admin"),
  requireOwnerAdmin: vi.fn(async () => "u-admin"),
  requireSuperAdmin: vi.fn(async () => "sa-test-1"),
  hasAdminAccess: vi.fn(async () => true),
}));
vi.mock("@/lib/auth", () => authMock);

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => cacheMock);

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
  clerkClient: vi.fn(),
}));

const dbServicesMock = vi.hoisted(() => ({
  getAllServices: vi.fn(),
  getActiveServices: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
  toggleService: vi.fn(),
}));
vi.mock("@/lib/db/services", () => dbServicesMock);

const dbBusinessMock = vi.hoisted(() => ({
  getBusinessSettingsOrCreate: vi.fn(),
  updateBusinessSettings: vi.fn(),
}));
vi.mock("@/lib/db/business", () => dbBusinessMock);

const dbCustomersMock = vi.hoisted(() => ({
  getCustomerByUserId: vi.fn(),
  getWalkInCustomers: vi.fn(),
  linkWalkInCustomer: vi.fn(),
  updateCustomerProfile: vi.fn(),
  getCustomerWithAppointments: vi.fn(),
}));
vi.mock("@/lib/db/customers", () => dbCustomersMock);

const dbAppointmentsMock = vi.hoisted(() => ({
  getAvailableSlots: vi.fn(),
  createAppointmentTx: vi.fn(),
  cancelAppointment: vi.fn(),
  getAppointmentById: vi.fn(),
  confirmAppointment: vi.fn(),
  adminCancelAppointment: vi.fn(),
  restoreAppointment: vi.fn(),
}));
vi.mock("@/lib/db/appointments", () => dbAppointmentsMock);

import { prisma } from "@/lib/prisma";
import { GENERIC_FORM_ERROR } from "@/lib/errors";
import { resetDb } from "../helpers/db";
import {
  createServiceAction,
  updateServiceAction,
  toggleServiceAction,
} from "@/app/actions/services";
import { updateBusinessSettingsAction } from "@/app/actions/business";
import {
  updateMyProfile,
  linkWalkInCustomerAction,
} from "@/app/actions/customers";
import {
  adminCancelAppointment,
  restoreAppointmentAction,
  confirmAppointment,
} from "@/app/actions/appointments";

const SENTINEL = "DB_DOWN_secret_9f3a";
const dbFailure = () => new Error(SENTINEL);

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  await resetDb();
  vi.clearAllMocks();
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  consoleErrorSpy.mockRestore();
  await resetDb();
});

function expectGenericFormError(result: unknown) {
  expect(result).toEqual({ errors: { form: GENERIC_FORM_ERROR } });
  expect(JSON.stringify(result)).not.toContain(SENTINEL);
}

function serviceFormData() {
  const formData = new FormData();
  formData.set("name", "Haircut");
  formData.set("description", "A quick trim");
  formData.set("category", "Hair");
  formData.set("price", "100");
  formData.set("durationMin", "30");
  formData.set("active", "true");
  return formData;
}

function businessFormData() {
  const formData = new FormData();
  formData.set("name", "Unknown Beauty");
  formData.set("phone", "");
  formData.set("address", "");
  formData.set("timeZone", "Asia/Kolkata");
  formData.set("openingHours", "{}");
  formData.set("closedWeekdays", "[]");
  formData.set("closures", "[]");
  formData.set("slotIntervalMin", "30");
  formData.set("minBookingNoticeMin", "120");
  formData.set("cancellationCutoffMin", "120");
  return formData;
}

async function seedCustomerRow(clerkUserId = "u-customer") {
  const user = await prisma.user.create({
    data: { clerkUserId, role: "customer", status: "active" },
  });
  const customer = await prisma.customer.create({
    data: { userId: user.id, name: "Alice" },
  });
  return { user, customer };
}

describe("server-action error shape: services", () => {
  it("returns { success } when the write succeeds", async () => {
    dbServicesMock.createService.mockResolvedValue(undefined);

    const result = await createServiceAction({ errors: {} }, serviceFormData());

    expect(result).toEqual({ success: "Service created successfully" });
    expect(cacheMock.revalidatePath).toHaveBeenCalled();
  });

  it("still returns field errors for invalid input without touching the db", async () => {
    const formData = serviceFormData();
    formData.set("price", "-5");

    const result = await createServiceAction({ errors: {} }, formData);

    expect(result.errors?.price).toBeTruthy();
    expect(result.errors?.form).toBeUndefined();
    expect(dbServicesMock.createService).not.toHaveBeenCalled();
  });

  it.each([
    ["createServiceAction", () => createServiceAction({ errors: {} }, serviceFormData())],
    [
      "updateServiceAction",
      () => updateServiceAction(1, { errors: {} }, serviceFormData()),
    ],
    ["toggleServiceAction", () => toggleServiceAction(1, false)],
  ])("%s returns the generic form error on a db failure", async (_name, run) => {
    dbServicesMock.createService.mockRejectedValue(dbFailure());
    dbServicesMock.updateService.mockRejectedValue(dbFailure());
    dbServicesMock.toggleService.mockRejectedValue(dbFailure());

    expectGenericFormError(await run());
  });

  it("logs the failure with server context", async () => {
    dbServicesMock.createService.mockRejectedValue(dbFailure());

    await createServiceAction({ errors: {} }, serviceFormData());

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:createServiceAction]",
      expect.any(Error),
    );
  });
});

describe("server-action error shape: business settings", () => {
  it("returns { success } when the write succeeds", async () => {
    dbBusinessMock.updateBusinessSettings.mockResolvedValue(undefined);

    const result = await updateBusinessSettingsAction(
      { errors: {} },
      businessFormData(),
    );

    expect(result).toEqual({ success: "Business settings saved successfully" });
  });

  it("returns the generic form error on a db failure", async () => {
    dbBusinessMock.updateBusinessSettings.mockRejectedValue(dbFailure());

    const result = await updateBusinessSettingsAction(
      { errors: {} },
      businessFormData(),
    );

    expectGenericFormError(result);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:updateBusinessSettingsAction]",
      expect.any(Error),
    );
  });

  it("still returns field errors without touching the db", async () => {
    const formData = businessFormData();
    formData.set("slotIntervalMin", "1");

    const result = await updateBusinessSettingsAction({ errors: {} }, formData);

    expect(result.errors?.slotIntervalMin).toBeTruthy();
    expect(result.errors?.form).toBeUndefined();
    expect(dbBusinessMock.updateBusinessSettings).not.toHaveBeenCalled();
  });
});

describe("server-action error shape: customers", () => {
  it("updateMyProfile returns the generic form error on a db failure", async () => {
    await seedCustomerRow();
    dbCustomersMock.updateCustomerProfile.mockRejectedValue(dbFailure());

    const formData = new FormData();
    formData.set("name", "Alice");
    formData.set("phone", "");
    formData.set("email", "");

    const result = await updateMyProfile({ errors: {} }, formData);

    expectGenericFormError(result);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:updateMyProfile]",
      expect.any(Error),
    );
  });

  it("linkWalkInCustomerAction returns the generic form error on a db failure", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-walkin", role: "customer", status: "active" },
    });
    dbCustomersMock.linkWalkInCustomer.mockRejectedValue(dbFailure());

    const formData = new FormData();
    formData.set("customerId", "1");
    formData.set("clerkUserId", "u-walkin");

    const result = await linkWalkInCustomerAction({ errors: {} }, formData);

    expectGenericFormError(result);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:linkWalkInCustomerAction]",
      expect.any(Error),
    );
  });

  it("still returns domain errors without the generic form error", async () => {
    const formData = new FormData();
    formData.set("customerId", "0");
    formData.set("clerkUserId", "");

    const result = await linkWalkInCustomerAction({ errors: {} }, formData);

    expect(result).toEqual({ errors: { form: "Invalid customer" } });
    expect(dbCustomersMock.linkWalkInCustomer).not.toHaveBeenCalled();
  });
});

describe("server-action error shape: appointment mutations", () => {
  it("adminCancelAppointment keeps its { ok, error } shape on a db failure", async () => {
    dbAppointmentsMock.adminCancelAppointment.mockRejectedValue(dbFailure());

    const result = await adminCancelAppointment(1);

    expect(result).toEqual({ ok: false, error: GENERIC_FORM_ERROR });
    expect(JSON.stringify(result)).not.toContain(SENTINEL);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:adminCancelAppointment]",
      expect.any(Error),
    );
  });

  it("adminCancelAppointment still reports the domain no-op message", async () => {
    dbAppointmentsMock.adminCancelAppointment.mockResolvedValue(false);

    const result = await adminCancelAppointment(1);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("already completed or cancelled");
  });

  it("restoreAppointmentAction keeps its { ok, error } shape on a db failure", async () => {
    dbAppointmentsMock.restoreAppointment.mockRejectedValue(dbFailure());

    const result = await restoreAppointmentAction(1);

    expect(result).toEqual({ ok: false, error: GENERIC_FORM_ERROR });
    expect(JSON.stringify(result)).not.toContain(SENTINEL);
  });

  it("confirmAppointment logs and rethrows (void action)", async () => {
    dbAppointmentsMock.confirmAppointment.mockRejectedValue(dbFailure());

    await expect(confirmAppointment(1)).rejects.toThrow(SENTINEL);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[server:confirmAppointment]",
      expect.any(Error),
    );
  });
});
