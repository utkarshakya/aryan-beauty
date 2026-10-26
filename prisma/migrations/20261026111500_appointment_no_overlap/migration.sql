-- Phase D of docs/plans/fix-plan.md: a DB-level guarantee against double booking.
--
-- Rule: the whole Appointment table is one schedule (single stylist). An
-- appointment occupies the half-open interval [startTime, endTime). Two rows
-- conflict iff a."startTime" < b."endTime" AND a."endTime" > b."startTime".
-- Only active rows participate — `cancelled` rows are free and rebookable.
--
-- A partial EXCLUDE constraint is enforced by PostgreSQL on every INSERT and
-- UPDATE, so it also covers `restoreAppointment` (cancelled -> confirmed) and
-- any future writer. Range types ship with built-in GiST support; no
-- extension is required.
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_no_overlap"
  EXCLUDE USING gist (tsrange("startTime", "endTime", '[)') WITH &&)
  WHERE (status <> 'cancelled');
