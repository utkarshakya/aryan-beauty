# Project Documentation

| File | Purpose |
|---|---|
| `product.md` | Product vision, roadmap, and principles |
| `architecture.md` | Technical structure, stack, and engineering rules |
| `plans/plan.md` | Active implementation checklist with detailed progress |
| `plans/ui-plan.md` | UI/UX improvement plan for visual polish |
| `ideas.md` | Future possibilities outside the active plan |

Read `product.md` for product direction, `architecture.md` before changing technical structure, and `plans/plan.md` before starting implementation work.

## Core Principle

> Build for the real parlour first. Learn from real usage. Add complexity only when it creates value.

## Quick Reference: Current State (24 September 2026)

**Completed Product Features:**
- Clerk authentication with 4 roles (super_admin, admin, staff, customer)
- Customer booking, appointment history, and self-cancellation with cutoff enforcement
- Owner appointment dashboard: list, search, date filter, detail view, status transitions (confirm/cancel/restore)
- Completed appointments auto-display (past confirmed appointments show as Completed)
- Service management: create, edit, activate/deactivate with snapshots on appointments
- Business settings: opening hours, closed weekdays, closures, slot interval, booking notice, cancellation cutoff, marketing fields
- Staff management: invite via Clerk, promote/demote, disable/restore, super-admin protection
- 39 tests covering authorization, disabled users, ownership, booking conflicts, cutoff, inactive services

**In Progress:**
- UI improvement plan (design foundation, shared primitives, public site polish, admin experience, responsive/a11y pass)

**Explicitly Postponed:**
- Multi-parlour/branch/tenant support
- Clerk Organizations
- Payments, subscriptions, advanced reports, AI, automated reminders
- Custom permission builders