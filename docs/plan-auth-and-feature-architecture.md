# Plan: Feature-Based Architecture & Clerk Auth Sync

## Overview
Simplify authentication data flow between Clerk and PostgreSQL (`User` & `Customer` models), optimize authorization performance via Clerk `publicMetadata`, and organize the codebase using a clean, scalable **Feature-Based Architecture**.

---

## 1. Feature-Based Architecture

### Principles
- **Thin `app/` Directory**: `app/` contains Next.js App Router routes, layouts, and API/webhook handlers only. Page components simply delegate rendering to feature components.
- **Modular `features/` Directory**: Business logic, database queries, server actions, feature-specific UI components, and TypeScript types live inside `features/<domain>/`.

### Directory Structure
```
app/                        # Next.js App Router (Routes, API Webhooks, Layouts)
features/                   # Domain-Driven Feature Modules
├── auth/                   # Clerk sync, RBAC helpers, user metadata management
│   ├── services/           # DB & Clerk sync logic (upsertUser, syncPublicMetadata)
│   ├── components/         # Auth status badges, User role selector
│   └── types/              # Auth & Role types
├── appointments/           # Appointment management domain
│   ├── actions/            # Server actions (createAppointment, updateStatus)
│   ├── components/         # Booking form, appointment list, calendar view
│   ├── db/                 # Prisma appointment queries
│   └── types/
├── customers/              # Customer profile & history domain
│   ├── actions/            # Profile actions & walk-in customer linking
│   ├── components/         # Customer table, history drawer, edit form
│   ├── db/                 # Prisma customer queries
│   └── types/
└── services-catalog/       # Salon services catalog domain
    ├── actions/            # Service CRUD actions
    ├── components/         # Service list, price edit modal
    ├── db/                 # Prisma service queries
    └── types/
components/ui/              # Shared UI primitives (Button, Modal, Input, Badge)
lib/                        # Core infrastructure singletons (prisma.ts, utils.ts)
```

---

## 2. Authentication, Roles & Webhook Sync Model

### Schema & Role Responsibilities
- **`User` Table (PostgreSQL)**: Sole owner of `clerkUserId`. Primary database record for identity, system `role` (`super_admin`, `admin`, `staff`, `customer`), `status` (`active`, `disabled`), `name`, and `email`.
- **`Customer` Table (PostgreSQL)**: Stores business domain profile (phone, appointment history). Linked 1:1 to `User` via `userId` foreign key. (Schema migration removes redundant `clerkUserId` from `Customer`).
- **Clerk `publicMetadata`**: Stores mirror of `{ role: UserRole, status: UserStatus }`. Synced automatically on user creation and role updates. Allows zero-DB lookup authorization checks directly in Clerk middleware and server session claims.

### Webhook Event Handling (`/api/webhooks/clerk`)
1. **`user.created`**:
   - Transactionally creates/upserts `User` record in DB.
   - **Walk-in Matching**: Checks if an unlinked `Customer` (`userId: null`) exists with the matching `email`. If found, links `customer.userId = newUserId`.
   - Calls `@clerk/nextjs/server` `clerkClient` to set `publicMetadata: { role: 'customer', status: 'active' }`.
2. **`user.updated`**:
   - Syncs updated `email`, `name`, and profile details to `User` and linked `Customer` records in PostgreSQL.
3. **`user.deleted`**:
   - Executes **Soft Delete** in PostgreSQL: sets `User.status = 'disabled'`.
   - Preserves all associated `Customer` and `Appointment` records to guarantee historical business analytics integrity.

### Dev & Fallback Sync (`getOrCreateUser()`)
- For local dev (where webhooks may not be configured) and missed webhook fallback, `getOrCreateUser()` checks if logged-in Clerk user has a DB `User` record. If missing, triggers the sync & walk-in matching logic synchronously.

### Admin Role Management Flow
- **Super Admin UI**: Super admins manage staff/admin privileges in the Admin Dashboard.
- Updating a user's role updates `User.role` in PostgreSQL and immediately syncs the updated role claim to Clerk via `clerkClient.users.updateUserMetadata()`.
- Emergency fallback bootstrap via `SUPER_ADMIN_CLERK_USER_IDS` environment variable remains active.

---

## 3. Implementation Steps

### Phase 1: Database Schema & Webhook Foundation
- [ ] Refactor `prisma/schema.prisma`: Remove `clerkUserId` from `Customer` model (rely solely on `userId` relation to `User`).
- [ ] Run `npx prisma migrate dev --name refactor_user_customer_auth`.
- [ ] Create `features/auth/services/sync.ts` with transactional user creation, walk-in customer matching, soft deletion, and Clerk `publicMetadata` sync helpers.
- [ ] Implement robust webhook handler `/api/webhooks/clerk/route.ts` using `svix`.
- [ ] Update `lib/auth.ts` / middleware to read role claims from `auth().sessionClaims?.metadata` for fast authorization.

### Phase 2: Feature Modularization
- [ ] Build `features/auth/` (role selection components, permission hooks, sync services).
- [ ] Modularize `features/appointments/` (actions, DB queries, UI components).
- [ ] Modularize `features/customers/` (profile management, walk-in matching UI).
- [ ] Modularize `features/services-catalog/` (catalog CRUD actions & views).

### Phase 3: Route Simplification & Verification
- [ ] Simplify routes under `app/(site)`, `app/admin`, and `app/auth` to render thin feature components.
- [ ] Test Clerk webhooks, walk-in email auto-linking, soft deletion, and role updates via Admin UI.

