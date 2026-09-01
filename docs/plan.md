# Active Implementation Plan

This is the implementation plan for the first real deployment of Unknown Beauty: one small beauty parlour operated by the owner's family. It is intentionally simpler than a SaaS architecture. The product should become useful for this parlour first; multi-business support is a later possibility.

## Progress update — 31 August 2026

- Phase 1 role activation is complete and verified with the real Clerk accounts.
- Phase 2 customer appointment experience is complete: customers can view upcoming/history appointments and securely cancel future bookings.
- Phase 3 is partially complete: the customer booking link is available in the signed-in navigation; broader navigation and polish remain.
- Phase 4 service management is now in progress.
- Service-management slice 1 is complete: active/inactive services, owner-only create/edit/toggle controls, and active-service filtering in public and booking flows.
- The migration `20260831130000_add_service_active_flag` has been applied and the service-management page is working.

Current checkpoint: role activation, customer appointments, and service-management slice 1 are complete. The next planned work is Phase 3 customer-facing navigation and polish, followed by the remaining service-management improvements and business settings. The detailed checklists below remain the source of the intended scope and order.

## Current baseline

- Public pages exist for the home page, services, and booking.
- Customers sign in with Clerk before booking.
- Bookings are stored in PostgreSQL through Prisma.
- Customers are stored separately from appointments and are linked to their Clerk user ID.
- The owner appointment page is at `/admin`.
- `/studio` was a legacy redirect and has been removed.
- The admin appointment view is responsive on mobile.
- The database now has a general `User` model with `super_admin`, `admin`, `staff`, and `customer` roles, plus `active` and `disabled` status.
- Server authorization recognizes the configured super admin, bootstrap admins, and active database staff/admin users.

## Roles and responsibility

### Super admin

The product creator's Clerk user ID is configured as the super admin.

Responsibilities:

- Full access to the application.
- Manage the owner's access and staff access.
- Change sensitive product or business configuration.
- Recover access if the owner account has a problem.

There should normally be only one super admin in this first version.

### Admin / parlour owner

The aunt's account is an admin, not a super admin.

Responsibilities:

- Manage daily appointments.
- View and manage customers.
- Manage services and prices.
- Manage ordinary staff accounts once that feature exists.

Restrictions:

- Cannot change or remove the super admin.
- Cannot change authentication configuration.
- Cannot delete the business or permanently destroy important records.
- Sensitive destructive actions should require confirmation or use reversible disabling/archive behavior.

### Staff

There may be multiple staff users.

Responsibilities:

- View the appointment schedule.
- Confirm, cancel, and update appointments according to the final permission rules.
- View the customer information needed for the appointment.

Restrictions:

- Cannot manage roles or users.
- Cannot change services, prices, or business settings unless explicitly permitted later.
- Cannot access another future business if the product becomes multi-business.

### Customer

Customers can:

- Browse services.
- Book appointments.
- View their own upcoming and past appointments.
- Cancel their own eligible appointments.

Customers cannot see admin or staff screens and cannot view another customer's data.

## Data and authorization plan

The `User` model is the access and identity table. The `Customer` model remains separate because it contains customer-specific business data. A user may have a customer profile, but staff and admins do not need to be customers.

The next data work should:

1. Keep `clerkUserId` unique in `User`.
2. Use the `User.role` and `User.status` values for authorization.
3. Create or update a `User` record when a known person signs in or is invited.
4. Keep existing `Customer` records and gradually connect them to `User` records where appropriate.
5. Never use client-editable metadata as permission proof.
6. Check authorization in every protected page, server action, and data mutation.
7. Keep the super admin configuration separate from ordinary admin records.

The first version does not need organizations, tenants, branch tables, or a general permissions matrix.

## Implementation phases

### Phase 1 — Finish role activation

Status: in progress.

- [x] Add `User`, `UserRole`, and `UserStatus` to Prisma.
- [x] Add the optional relationship between `User` and `Customer`.
- [x] Add server checks for active `super_admin`, `admin`, and `staff` users.
- [x] Remove the unused `/studio` route.
- [x] Put the real super-admin Clerk ID in `.env`.
- [x] Put the aunt's Clerk ID in the bootstrap-admin environment variable.
- [x] Sign in as the aunt once to create her database user record.
- [x] Confirm that the aunt can access appointments but cannot access super-admin-only actions.
- [x] Decide whether the bootstrap admin ID should be removed from the environment after its database record exists.

### Phase 2 — Customer appointment experience

This is the next major product feature because customers currently have no way to see what they booked.

Frontend:

- Add a customer-facing “My Appointments” link for signed-in users.
- Add a page showing upcoming appointments first.
- Show service, date, time, status, and relevant contact details.
- Add a past/cancelled appointment section or filter.
- Add an empty state for customers with no bookings.
- Add a cancel action with a confirmation step.
- Show success and error feedback after cancellation.
- Make the page usable on small phones.

Backend requirements before the UI:

- Look up the current Clerk user ID.
- Find only the current user's customer record.
- Query appointments through that customer record.
- Prevent a customer from cancelling another customer's appointment by changing an ID in a request.
- Define a cancellation rule, such as no cancellation inside a configurable number of hours before the appointment.
- Keep cancelled appointments for history rather than deleting them.

Booking improvements to consider in the same phase:

- Show a clear confirmation link after booking.
- Prevent duplicate submissions.
- Make the customer's phone/profile information easier to update.
- Explain what happens after an appointment is booked and whether the parlour confirms it.

Definition of done:

- A customer can sign in, book, refresh the page, and see the booking in “My Appointments”.
- A customer sees only their own appointments.
- A customer can cancel only when allowed by the cancellation rule.
- The owner still sees the correct appointment status in `/admin`.

### Phase 3 — Customer-facing navigation and polish

- Add clear links for Home, Services, Book, and My Appointments.
- Keep admin links out of the customer navigation unless the current user is authorized.
- Make sign-in and sign-up redirects return users to the useful destination.
- Add loading states for booking and appointment actions.
- Add error and not-found states for protected pages.
- Review all customer pages on phone, tablet, and desktop widths.
- Check keyboard navigation, visible focus states, labels, and readable contrast.

### Phase 4 — Service management for the owner

Build an owner-facing service management screen before staff management.

Capabilities:

- List all services.
- Add a service with name, description, category, price, and duration.
- Edit service details.
- Mark a service inactive/unavailable without deleting its historical bookings.
- Restore an inactive service.
- Validate prices, durations, and required fields.

Permissions:

- Super admin: full access.
- Admin: create, edit, and deactivate services.
- Staff: read-only service information unless a later decision grants more access.
- Customer: read active services only.

The booking flow must never offer inactive services, but old appointments must continue to display their original service information.

### Phase 5 — Business settings

Add a small settings area for the parlour owner.

Initial settings:

- Business name and contact information.
- Time zone.
- Opening and closing hours.
- Closed weekdays.
- Holiday/closure dates.
- Booking slot interval.
- Minimum notice before booking.
- Cancellation cutoff.

Permissions:

- Super admin: full access.
- Admin: operational settings only.
- Staff: no access by default.

Changing settings must not invalidate or move existing appointments. New availability calculations should use the updated settings.

### Phase 6 — Better owner appointment workflow

Improve `/admin` after customer and service workflows are stable.

- Add search by customer name or phone.
- Add date filtering and a date selector.
- Add appointment detail view.
- Show customer email and notes where useful.
- Keep status transitions explicit and validated.
- Add a reliable empty state for each filter.
- Make destructive actions reversible where possible.
- Add a clear indication of who performed an action once audit logging exists.

### Phase 7 — Staff management (do this last)

Build a user-management screen available to the super admin and, if desired, the parlour admin.

Capabilities:

- Invite a staff member through Clerk.
- Create or activate the matching database `User` record.
- Assign the `staff` role.
- Disable a staff member without deleting their historical actions.
- Restore a disabled staff member.
- View role and account status.
- Prevent anyone except the super admin from creating or modifying a super admin.

Before building this screen, decide whether the aunt may manage staff or whether only you may do so. The default recommendation is that the aunt may add/disable staff but may not modify admin or super-admin accounts.

### Phase 8 — Reliability and launch readiness

- Add authorization tests for every role.
- Test disabled accounts.
- Test ownership of customer appointment queries and mutations.
- Test booking conflicts and cancellation edge cases.
- Add audit logging for role changes and sensitive admin actions.
- Add database backups and a recovery procedure.
- Review environment variables and remove obsolete names.
- Test production Clerk configuration and redirect URLs.
- Test the complete flow on a real phone.
- Document how the super admin can recover the owner's account.

## Explicitly postponed

Do not implement these for the single-parlour version unless real usage requires them:

- Multiple businesses or branches.
- Clerk Organizations.
- Subscription billing.
- Payments.
- Advanced reports.
- AI features.
- Automated reminders.
- Complex custom permission builders.

These can be considered after the first parlour has used the product and exposed real needs.

## Working order for future sessions

When implementation resumes, use this order:

1. Verify the real Clerk IDs and role activation.
2. Build the customer “My Appointments” backend and page.
3. Add customer navigation and polish.
4. Build service management.
5. Build business settings.
6. Improve the owner appointment workflow.
7. Build staff management.
8. Run security, accessibility, mobile, and production checks.
