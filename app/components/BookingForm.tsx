"use client";

import { useActionState } from "react";
import type { Service } from "@prisma/client";
import { createAppointment, type BookingState } from "@/app/actions";

const initialState: BookingState = { errors: {} };

const inputClasses =
  "w-full px-4 py-2 rounded-lg border border-pink-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400";
const errorClasses = "mt-1 text-sm text-red-600";

export default function BookingForm({
  services,
  preselectedServiceId,
}: {
  services: Service[];
  preselectedServiceId?: number;
}) {
  const [state, formAction, pending] = useActionState(
    createAppointment,
    initialState,
  );

  const errors = state && "errors" in state ? state.errors : {};

  if (state && "success" in state) {
    const { serviceName, startTime, name, phone } = state.success;
    const formatted = new Date(startTime).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Booking Confirmed
        </h2>
        <p className="text-gray-600 mb-2">Thank you, {name}!</p>
        <p className="text-gray-600 mb-2">
          We have received your appointment request.
        </p>
        <div className="bg-white rounded-lg p-4 my-6 text-left space-y-1">
          <p>
            <span className="font-semibold text-gray-800">Service:</span>{" "}
            <span className="text-gray-600">{serviceName}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-800">Date & time:</span>{" "}
            <span className="text-gray-600">{formatted}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-800">Phone:</span>{" "}
            <span className="text-gray-600">{phone}</span>
          </p>
        </div>
        <p className="text-sm text-gray-500">
          We will confirm your appointment shortly.
        </p>
      </div>
    );
  }

  const submit = (formData: FormData) => {
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    if (date && time) {
      const startTime = new Date(`${date}T${time}`);
      if (!Number.isNaN(startTime.getTime())) {
        formData.set("startTime", startTime.toISOString());
      }
    }
    formAction(formData);
  };

  return (
    <form action={submit} className="space-y-5">
      {errors.form && (
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {errors.form}
        </p>
      )}

      <div>
        <label htmlFor="serviceId" className="block text-gray-700 mb-1">
          Service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          defaultValue={preselectedServiceId ?? ""}
          className={inputClasses}
        >
          <option value="" disabled>
            Select a service
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — ₹{Math.round(service.price)} (
              {service.durationMin} min)
            </option>
          ))}
        </select>
        {errors.serviceId && <p className={errorClasses}>{errors.serviceId}</p>}
      </div>

      <div>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className={inputClasses}
        />
        {errors.name && <p className={errorClasses}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="10-digit mobile number"
          className={inputClasses}
        />
        {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="date" className="block text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-gray-700 mb-1">
            Time
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            className={inputClasses}
          />
        </div>
      </div>
      {errors.startTime && <p className={errorClasses}>{errors.startTime}</p>}

      <div>
        <label htmlFor="notes" className="block text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={100}
          placeholder="Anything we should know?"
          className={inputClasses}
        />
        {errors.notes && <p className={errorClasses}>{errors.notes}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
