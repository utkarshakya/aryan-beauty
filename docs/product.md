# Product

## Vision

Build a simple, useful digital product for one real family-run beauty parlour.
The owner should be able to manage daily work without technical knowledge, and
customers should be able to book and manage their own appointments easily.

This is also a learning project for building a complete Next.js product:
frontend UI, server-side logic, databases, authentication, production systems,
and eventually AI. AI is a long-term direction, not a requirement for the
first release.

## Definition of success

The first success is a working product the parlour can use with real customers:

- customers can browse active services and book appointments;
- customers can see their own upcoming and past appointments;
- the owner can manage appointments and services;
- permissions protect owner data and operations;
- the system is understandable enough to operate and maintain.

## Roadmap

This is the product roadmap, not the detailed implementation checklist. The
current checklist and exact order live in [`plan.md`](plan.md).

### Phase 1 — First usable product

The public site, Clerk sign-in, service catalog, customer booking, customer
appointment history/cancellation, owner appointment dashboard, and basic
service management are implemented. Final validation and production readiness
remain tracked in `plan.md`.

### Phase 2 — Product quality and operational workflows

Finish responsive/accessibility review, improve the owner appointment workflow,
add business settings, and make the existing service and appointment data more
reliable. These are the current priorities before adding larger capabilities.

### Phase 3 — Grow the salon system

Introduce additional management only when real usage justifies it:

- staff management;
- customer history improvements;
- payments and expenses;
- reports and analytics;
- reminders and other operational workflows.

The exact features remain intentionally flexible.

### Phase 4 — AI and automation

After the core workflows have stable real data, explore useful AI and
automation such as service recommendations, owner questions over salon data,
appointment reminders, customer re-engagement, and demand insights.

### Long-term direction

If real usage shows that the product works for more than the first parlour,
consider multiple salons or branches. Do not add organizations, tenants,
subscriptions, or complex permissions before that need is demonstrated.

## Principles

1. Build for the real parlour first.
2. Keep the owner's experience simple.
3. Ship one meaningful capability at a time.
4. Let real usage determine later features.
5. Prefer simple engineering when it is sufficient.
6. Keep future complexity out of the first release.
