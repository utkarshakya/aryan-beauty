# Backend API Readiness Audit

Read-only audit for a future Expo mobile client using Clerk Bearer tokens.

## Findings

| action | issue | severity | file:line |
|---|---|---:|---|
| `createAppointment` | Availability is checked before the transaction, then rechecked without locking or a database exclusion/unique constraint. Two concurrent requests can double-book. | high | [appointments.ts:101](../app/actions/appointments.ts#L101), [appointments.ts:124](../app/actions/appointments.ts#L124), [schema.prisma:65](../prisma/schema.prisma#L65) |
| `getAdminAppointments` | Full appointment/customer records are returned without pagination. Optional filters allow an unbounded result. | medium | [appointments.ts:325](../app/actions/appointments.ts#L325), [appointments.ts:360](../app/actions/appointments.ts#L360) |
| `getCustomerDetailAction` | Returns all customer appointments without pagination. | medium | [customers.ts:116](../app/actions/customers.ts#L116), [customers.ts:78](../lib/db/customers.ts#L78) |
| `getWalkInCustomersAction` | Returns all walk-in customers and related user records without pagination or an action-level field projection. | low | [customers.ts:75](../app/actions/customers.ts#L75), [customers.ts:50](../lib/db/customers.ts#L50) |
| `linkWalkInCustomerAction` | Does not verify that the target is actually an unlinked walk-in customer; an admin can reassign an existing relationship. | medium | [customers.ts:80](../app/actions/customers.ts#L80), [customers.ts:58](../lib/db/customers.ts#L58) |
| `updateBusinessSettingsAction` | JSON fields and timezone are parsed but not structurally validated. Invalid configuration can later break availability. | medium | [business.ts:22](../app/actions/business.ts#L22), [business.ts:27](../app/actions/business.ts#L27) |
| `createServiceAction` / `updateServiceAction` | Description length and some runtime argument types are not bounded. | low | [services.ts:33](../app/actions/services.ts#L33), [services.ts:87](../app/actions/services.ts#L87) |
| `getAdminAppointments` | Status filters, dates, and options are trusted as typed values; malformed payloads can produce Prisma errors instead of controlled validation responses. | low | [appointments.ts:325](../app/actions/appointments.ts#L325) |
| `getAdminAppointmentCounts` / `getUpcomingAppointments` | Date arguments are not explicitly validated at the action boundary. | low | [appointments.ts:396](../app/actions/appointments.ts#L396), [appointments.ts:430](../app/actions/appointments.ts#L430) |
| `confirmAppointment` | Silently returns for invalid/already-processed appointments and throws on database failures, unlike neighboring actions. | low | [appointments.ts:241](../app/actions/appointments.ts#L241) |
| `getServicesAction` | Returns the complete service catalog and counts without pagination. | low | [services.ts:18](../app/actions/services.ts#L18), [services.ts:20](../lib/db/services.ts#L20) |
| Staff listing actions | Returns Clerk IDs, email addresses, names, roles, and statuses to the admin UI. Authorized, but exposes internal identifiers and personal data. | low | [users.ts:11](../app/actions/users.ts#L11), [users.ts:13](../lib/db/users.ts#L13) |

## Action-by-action audit

| action | logic location / web coupling | auth / authorization | validation, concurrency, and errors |
|---|---|---|---|
| `getAvailableSlotsAction` | Availability is in `lib/db/appointments.ts`; wrapper is thin. | `requireActiveUser`; customer identity is not user-supplied. | Basic ID/date checks; date shape is checked but not calendar validity. Returns `[]` for invalid input. |
| `createAppointment` | Validation and transaction are partly inline; slot calculation is extracted. Uses `FormData` and `revalidatePath`. | `requireActiveUser`; account identity comes from Clerk. | Phone/service/date validation exists. Transaction does not prevent concurrent overlap. Returns `{ errors }` or `{ success }`. |
| `cancelMyAppointment` | Customer lookup/form parsing inline; cancellation rule extracted. Uses `FormData` and revalidation. | `requireActiveUser`; ownership is enforced by `customerId` in `updateMany`. | ID, cutoff, status, and ownership are enforced atomically. Returns `{ error }` or `{ success }`. |
| `confirmAppointment` | Transition extracted; revalidation remains in wrapper. | `requireAdmin`; server-side role check. | ID check only. Silent no-op or rethrow. |
| `adminCancelAppointment` | Transition extracted; thin wrapper. | `requireAdmin`. | Atomic status predicate. Returns `{ ok, error? }`. |
| `restoreAppointmentAction` | Transition extracted; thin wrapper. | `requireAdmin`. | Atomic status/time predicate. Returns `{ ok, error? }`. |
| `getAdminAppointmentAction` | Query extracted; display-status mapping inline. | `requireAdmin`; arbitrary IDs cannot be queried by customers. | Returns full appointment/customer/service object or `null`. |
| `getAdminAppointments` | Query, filtering, mapping, and result-size policy are inline. | `requireAdmin`. | Input types trusted; no pagination; full customer relation returned. |
| `getAdminAppointmentCounts` | Prisma counts inline. | `requireAdmin`. | No explicit date validation; returns aggregate counts. |
| `getUpcomingAppointments` | Prisma query inline. | `requireAdmin`. | Limited to five records; no explicit date validation. |
| `getBusinessSettingsAction` | Database function extracted. | `requireOwnerAdmin`. | Returns complete settings model, including internal `id`. |
| `updateBusinessSettingsAction` | Parsing/validation inline; update extracted. Uses `FormData` and revalidation. | `requireOwnerAdmin`. | Scalar checks are partial; JSON/timezone values are trusted. Returns `{ errors }` or `{ success }`. |
| `getMyProfile` | Lookup mostly extracted; app-user lookup inline. | `requireActiveUser`; derives identity from Clerk. | Correct ownership. Returns the current profile and linked user metadata. |
| `updateMyProfile` | Lookup/validation inline; update extracted. Uses `FormData` and revalidation. | `requireActiveUser`; only caller’s customer row is updated. | Name/phone validated; email format is not. Returns `{ errors }` or `{ success }`. |
| `getWalkInCustomersAction` | Query extracted. | `requireAdmin`. | No input; unbounded list. |
| `linkWalkInCustomerAction` | Lookup/parsing inline; update extracted. Uses `FormData` and revalidation. | `requireAdmin`. | IDs checked; target customer state is not checked. Returns `{ errors }` or `{ success }`. |
| `getCustomerDetailAction` | Query extracted. | `requireAdmin`. | Customer ID is not validated; appointments are unbounded. |
| `getServicesAction` | Query extracted. | `requireOwnerAdmin`. | No input; full catalog and counts. |
| `getActiveServicesAction` | Query extracted; intentionally public. | No auth guard. Suitable only for public catalog data. | No input; active catalog only. |
| `createServiceAction` | Validation inline; write extracted. Uses `FormData` and revalidation. | `requireOwnerAdmin`. | Basic validation; description unbounded. Returns `{ errors }` or `{ success }`. |
| `updateServiceAction` | Validation inline; write extracted. Uses `FormData` and revalidation. | `requireOwnerAdmin`. | Basic validation and ID checks. Returns `{ errors }` or `{ success }`. |
| `toggleServiceAction` | Write extracted; wrapper handles revalidation. | `requireOwnerAdmin`. | ID checked; `active` trusted at runtime. Returns `{ errors }` or `{ success }`. |
| `getStaffUsersAction` | Query extracted. | `requireOwnerAdmin`. | No input; returns internal IDs and personal data. |
| `inviteStaffAction` | Clerk API call and parsing inline. Uses `FormData` and revalidation. | `requireOwnerAdmin`. | Basic email validation; role fixed to staff. Returns `{ errors }` or `{ success }`. |
| `updateRoleAction` | Delegates to `setUserRole`; revalidation in wrapper. | Guard is inside helper: owner admin, plus super-admin for granting admin. | Role allowlist, target/self/super-admin checks. Returns `{ ok, error? }`. |
| `disableUserAction` | Delegates to `disableUser`; revalidation in wrapper. | Guard is inside helper: owner admin, with target/self/super-admin checks. | Clerk ID is only string-checked by TypeScript; helper handles target checks. Returns `{ ok, error? }`. |
| `restoreUserAction` | Delegates to `restoreUser`; revalidation in wrapper. | Guard is inside helper: owner admin, with target/self/super-admin checks. | Clerk ID is only string-checked by TypeScript; helper handles target checks. Returns `{ ok, error? }`. |

## Server-marked internal functions

`lib/auth/sync.ts` also has a `"use server"` directive and exports `upsertUserFromClerk`, `syncPublicMetadata`, `softDeleteUser`, `updateUserRole`, `setUserRole`, `disableUser`, `restoreUser`, and `getOrCreateUser`.

- `setUserRole`, `disableUser`, and `restoreUser` enforce authorization internally.
- `updateUserRole` requires `requireSuperAdmin`.
- `upsertUserFromClerk`, `syncPublicMetadata`, `softDeleteUser`, and `getOrCreateUser` do not authenticate callers themselves. They are safe only because current call sites are the verified Clerk webhook or already-authorized server code.
- The webhook verifies Svix signatures before invoking them: [route.ts:22](../app/api/webhooks/clerk/route.ts#L22).

## Clerk Bearer-token readiness

The guards use Clerk `auth()` rather than a custom cookie-only session system. Current Clerk documentation says session tokens may be sent as `Authorization: Bearer <session_token>` for cross-origin requests, and `auth()` defaults to accepting `session_token`; therefore the guards can identify an Expo user when Clerk middleware processes the request.

References: [Clerk authenticated requests](https://clerk.com/docs/guides/development/making-requests), [Clerk `auth()`](https://clerk.com/docs/reference/nextjs/app-router/auth), and [Clerk session tokens](https://clerk.com/docs/guides/sessions/session-tokens).

Server actions are still a poor mobile API contract. Expo would need to reproduce the Next server-action protocol, while current responses mix redirects, thrown errors, `void`, `{ ok }`, `{ error }`, and `{ errors }`. Dedicated JSON Route Handlers should be added for the mobile API.

## Global checks

- **Prisma singleton:** Present. `globalThis` caching is used in development; production module scope creates one client per process. See [lib/prisma.ts:4](../lib/prisma.ts#L4).
- **Runtime database URL:** The application uses `DATABASE_URL`; repository documentation states this is the Supabase pooler URL, while `DIRECT_URL` is for Prisma CLI operations. See [lib/prisma.ts:10](../lib/prisma.ts#L10) and [docs/scripts.md:56](scripts.md#L56). The deployed value cannot be confirmed from the repository.
- **Secrets:** No action returns Clerk `privateMetadata` or a full Clerk Backend User. Returned Prisma objects do expose internal IDs, Clerk IDs, emails, phone numbers, and role/status fields.
- **Timezone:** Availability deliberately converts business-local times to instants. The main risk is malformed timezone/opening-hour configuration being accepted by the settings action.
- **Existing tests:** Ownership and several state transitions are covered, but there is no apparent concurrency test or database constraint preventing overlapping appointments.

## API-layer refactoring summary

Moderate refactoring is needed. Domain logic is already partly separated in `lib/db/*`, especially availability, cancellation, service operations, customer operations, and role management. The remaining work is to extract inline validation/orchestration into plain functions, keep `FormData`/redirect/revalidation in thin web wrappers, and expose the same functions through stable JSON endpoints.

## Suggested fix order

1. Fix double-booking with database/transaction-level overlap protection; application prechecks alone are insufficient.
2. Add dedicated JSON endpoints with Bearer-authenticated contracts, HTTP status codes, schemas, and consistent errors.
3. Centralize validation, especially business-settings JSON/timezone data and non-FormData arguments.
4. Add pagination and explicit field selection for appointment, customer, service, and staff queries.
5. Restrict relationship mutations such as walk-in linking to valid unlinked targets.
6. Standardize action error shapes and keep redirects/revalidation in web-specific wrappers.
