# Product

## Vision

Build a simple, useful digital product for one real family-run beauty parlour. The owner should be able to manage daily work without technical knowledge, and customers should be able to book and manage their own appointments easily.

This is also a learning project for building a complete Next.js product: frontend UI, server-side logic, databases, authentication, production systems, and eventually AI. AI is a long-term direction, not a requirement for the first release.

## Definition of Success

The first success is a working product the parlour can use with real customers:

- customers can browse active services and book appointments;
- customers can see their own upcoming and past appointments;
- the owner can manage appointments and services;
- permissions protect owner data and operations;
- the system is understandable enough to operate and maintain.

## Roadmap

This is the product roadmap, not the detailed implementation checklist. The current checklist and exact order live in [`plans/plan.md`](plans/plan.md).

### Phase 1 — First Usable Product ✅ Complete

The public site, Clerk sign-in, service catalog, customer booking, customer appointment history/cancellation, owner appointment dashboard, and basic service management are implemented. Final validation and production readiness remain tracked in `plans/plan.md`.

### Phase 2 — Product Quality and Operational Workflows ✅ Complete

Finish responsive/accessibility review, improve the owner appointment workflow, add business settings, and make the existing service and appointment data more reliable. These were the priorities before adding larger capabilities.

### Phase 3 — Grow the Salon System 🔄 In Progress (Staff Management Complete)

Introduce additional management only when real usage justifies it:

- ✅ Staff management (invite, promote/demote, disable/restore, super-admin protection)
- Customer history improvements
- Payments and expenses
- Reports and analytics
- Reminders and other operational workflows

The exact features remain intentionally flexible.

### Phase 4 — AI and Automation

After the core workflows have stable real data, explore useful AI and automation such as service recommendations, owner questions over salon data, appointment reminders, customer re-engagement, and demand insights.

### Long-term Direction

If real usage shows that the product works for more than the first parlour, consider multiple salons or branches. Do not add organizations, tenants, subscriptions, or complex permissions before that need is demonstrated.

## Principles

1. Build for the real parlour first.
2. Keep the owner's experience simple.
3. Ship one meaningful capability at a time.
4. Let real usage determine later features.
5. Prefer simple engineering when it is sufficient.
6. Keep future complexity out of the first release.

## Current Product Capabilities (24 September 2026)

### Customer-Facing
- **Public site**: Hero, services preview, services catalog with category filter
- **Authentication**: Clerk sign-in/sign-up with redirect handling
- **Booking**: Select active service, pick available time slot, confirm booking
- **Appointments page**: Upcoming and history tabs, cancel eligible upcoming appointments
- **Cancellation cutoff**: Enforced per business settings (default 120 minutes)

### Owner Admin Dashboard
- **Today's workspace**: Summary cards (today, pending, confirmed, active services), upcoming today list
- **Appointments list**: Status tabs (pending, confirmed, cancelled, completed), search by name/phone, date picker (today/all dates/specific date), scope-aware empty states
- **Appointment detail**: Customer contact, service snapshot (name/price/duration at booking), schedule, notes, status badge, confirm/cancel/restore actions
- **Completed appointments**: Past confirmed appointments auto-display as Completed with no actions
- **Validated transitions**: pending→confirmed, pending/confirmed→cancelled (before cutoff), cancelled→confirmed (restore, while upcoming)

### Service Management
- **Create/edit services**: Name, category, price, duration, active toggle
- **Validation**: Required name, positive price, duration 15–480 min
- **Snapshots**: Appointment captures service name, price, duration at booking time
- **Inactive handling**: Hidden from booking/public pages, historical appointments preserved

### Business Settings
- **Contact/marketing**: Name, phone (display/href), address (line 1/2), tagline, description
- **Scheduling**: Timezone, per-weekday opening hours, closed weekdays, closure dates
- **Booking rules**: Slot interval, minimum booking notice, cancellation cutoff
- **Scope**: Changes affect new availability only; existing appointments unchanged

### Staff Management
- **Invite staff**: Clerk email invitation, auto-assign `staff` role on acceptance
- **Promote/demote**: Customer↔Staff transitions by owner/admin
- **Disable/restore**: Immediate access revocation, history preserved
- **Protections**: Owner cannot disable self, cannot modify super-admin, cannot grant admin role (super-admin only)

### Access & Safety
- Role/status read from database on every request (not session)
- Disabled accounts lose access immediately
- Clerk webhook preserves existing role/status
- Super-admin via env only; bootstrap admin is one-time provisioning

## Next Product Direction: People and Permissions

The next major capability is a People area for managing customers, staff, admins, and walk-in customers in one place.

Planned ideas:

- Search people and view their profiles and appointment history.
- Invite staff and manage customer-to-staff promotion or demotion.
- Disable and restore accounts without deleting their history.
- Use capability-based permissions alongside role templates.
- Let the super admin grant or revoke individual capabilities.
- Keep super-admin accounts protected from changes inside the application.
- Create walk-in customers and link them to existing customer accounts.
- Apply the new permissions to appointments, services, business settings, and customer actions.
- Add tests and manual checks for each role and permission combination.

After this feature is complete, run the full product flow on a real phone before launch.