# Product Polish V1.1 — Super Plan

## Purpose

V1 infrastructure and the core booking workflow are working. This phase turns the technically functional MVP into a product that feels credible to a real beauty parlour customer and usable by the owner.

This is a **planning and product-improvement phase**, not a feature-expansion phase.

The goal is to reach a version that Utkarsh can confidently demonstrate to the parlour owner before making the product public.

## Learning principle

This project is also a learning project. The agent must therefore:

- explain what is being changed and why before implementation;
- teach the relevant Next.js, React, Tailwind CSS, UX, accessibility, and product-design concepts;
- prefer guiding Utkarsh through implementation instead of silently doing the work;
- not modify files, run commands, or execute changes unless explicitly requested;
- inspect the current implementation before recommending changes;
- avoid introducing libraries or architecture merely for visual polish unless there is a clear reason.

## Current baseline

The current V1 provides:

- Next.js application;
- Clerk authentication;
- Prisma 7.9.1 + Supabase PostgreSQL;
- public services page backed by the database;
- customer appointment booking without requiring an account;
- server-side validation and appointment-overlap protection;
- Clerk-protected owner appointment management;
- pending/confirmed/cancelled states;
- production deployment on Netlify;
- verified production booking and owner-confirmation flow.

The current UI is intentionally MVP-level and needs substantial product/UX polish.

## Success criteria

Before demonstration, the product should satisfy these questions:

### Customer

- Can a first-time visitor understand what Aryan Beauty is within seconds?
- Does the site look trustworthy and intentional rather than like a developer prototype?
- Can a customer find a desired service quickly?
- Is booking understandable without explanation?
- Is the booking flow comfortable on a phone?
- Are validation, loading, unavailable-slot, error, and success states clear?
- Does the confirmation clearly explain what happens next?
- Are business identity, contact/location, and relevant expectations easy to find?

### Owner

- Can a non-technical owner understand the studio immediately?
- Can she see what requires attention today?
- Can she quickly confirm or cancel an appointment?
- Are appointment details readable without interpreting a database table?
- Does the interface work well on the device she is likely to use?
- Are action results and errors understandable?

### Quality

- Responsive across mobile and desktop;
- consistent visual system;
- accessible interactive controls and forms;
- no obvious contradictory copy;
- no known broken routes or placeholder content;
- no unnecessary complexity;
- documentation accurately reflects the real deployment.

## Phase structure

### Phase 0 — Product audit and baseline

Create a factual inventory of the current customer and owner journeys, screens, components, data, and UX problems.

Deliverables:

- current product map;
- customer journey audit;
- owner journey audit;
- UI/design audit;
- UX-state inventory;
- prioritized problem list.

Do not redesign or code before this audit is agreed.

Sub-plan: `08-product-audit.md`

### Phase 1 — Design learning foundation

Teach the agent/project the design and frontend principles needed for this work.

Topics should include:

- Tailwind CSS layout, spacing, responsive design, states, and composition;
- Next.js App Router UI patterns and server/client boundaries;
- React component design;
- accessibility fundamentals;
- mobile-first design;
- visual hierarchy, typography, spacing, contrast, and interaction feedback;
- practical product UX patterns for booking flows and dashboards.

We may add curated `design.md` and skill/reference documents to the repository or agent workspace, but only from legitimate documentation/reference material and only when useful.

The purpose is not to copy a popular website. The purpose is to teach reusable design principles and patterns.

Sub-plan: `09-design-foundation.md`

### Phase 2 — Product visual language

Define the visual identity for Aryan Beauty before rebuilding individual screens.

Decide:

- brand direction;
- color palette;
- typography;
- spacing scale;
- container widths;
- border/radius language;
- buttons;
- form controls;
- cards;
- status badges;
- navigation;
- responsive behavior;
- reusable UI conventions.

Deliverable: a small project-specific design system documented before broad UI implementation.

Sub-plan: `10-design-system.md`

### Phase 3 — Customer experience redesign

Improve the complete public journey rather than isolated pages.

Likely work areas:

- navigation and branding;
- homepage information hierarchy;
- services discovery;
- service cards and categories;
- booking entry points;
- booking form usability;
- date/time experience;
- validation and error states;
- loading state;
- unavailable appointment handling;
- confirmation/success experience;
- contact/about/business information;
- mobile experience.

Do not add functionality merely because other booking websites have it. Every addition must solve an identified user problem.

Sub-plan: `11-customer-experience.md`

### Phase 4 — Owner/studio experience redesign

Transform `/studio` from a functional database-style table into a simple owner workflow.

Likely work areas:

- studio navigation/header;
- today overview;
- appointment grouping;
- pending attention;
- appointment cards/details;
- confirm/cancel actions;
- status communication;
- empty states;
- action loading/error/success feedback;
- mobile usability;
- future extensibility without overbuilding.

Sub-plan: `12-owner-experience.md`

### Phase 5 — UX reliability and edge cases

Review the improved product specifically for failure and boundary conditions.

Cover:

- invalid input;
- duplicate customer phone;
- unavailable time slot;
- stale booking form;
- service no longer existing;
- network/server failure;
- slow actions;
- empty service data;
- empty appointments;
- cancelled appointments;
- past dates/times;
- timezone/date formatting;
- keyboard and screen-reader basics;
- responsive breakpoints.

Sub-plan: `13-ux-reliability.md`

### Phase 6 — Real-device product review

Test the product as an actual customer and owner, not as a developer.

Test:

- mobile customer journey;
- desktop customer journey;
- owner workflow on a likely phone/tablet/desktop;
- fresh-user comprehension;
- booking from beginning to end;
- owner confirmation/cancellation;
- all major error and success states.

Record findings and fix only meaningful issues.

Sub-plan: `14-real-world-review.md`

### Phase 7 — Demo readiness

Prepare the polished version for demonstration to the owner.

Checklist:

- production deployment verified;
- representative services/data present;
- customer booking works;
- owner workflow works;
- no placeholder/demo copy;
- no obvious broken states;
- security-sensitive configuration remains private;
- documentation is current;
- known limitations documented;
- demonstration flow prepared.

Sub-plan: `15-demo-readiness.md`

## Design knowledge and agent skills

Design knowledge belongs in this phase, specifically Phase 1, rather than being mixed into the implementation plans.

Recommended structure:

```text
docs/
  design/
    principles.md
    tailwind.md
    nextjs-ui.md
    accessibility.md
    inspiration.md
```

Use these as learning/reference material, not as instructions to blindly reproduce another site's design.

### About popular-site design.md files

We can study high-quality products such as established SaaS, booking, hospitality, or beauty websites for patterns such as:

- hierarchy;
- navigation;
- CTA placement;
- cards;
- responsive behavior;
- empty states;
- forms;
- dashboards.

However, we should document **principles and observations**, not copy proprietary source code, assets, text, or an entire visual identity.

Prefer official documentation for technical skills, especially:

- Next.js documentation;
- Tailwind CSS documentation;
- React documentation;
- accessibility/WCAG guidance.

For visual inspiration, record what a design does well and why it works.

## Prioritization method

Every proposed improvement should be classified as:

- **P0 — Demonstration blocker:** must fix before showing the owner;
- **P1 — High-value polish:** strongly improves customer/owner experience;
- **P2 — Nice-to-have:** useful but not required for demonstration;
- **Later:** intentionally deferred until real usage provides evidence.

Do not allow P2 features to delay the core product polish.

## Explicit non-goals for V1.1

Unless the audit discovers a critical need, do not add:

- online payments;
- customer accounts;
- staff management;
- advanced analytics;
- loyalty programs;
- AI features;
- complex notification infrastructure;
- multi-branch support;
- elaborate CMS functionality.

These can be considered after the owner sees and evaluates the product.

## Documentation rule

Each implementation phase gets a separate sub-plan. A sub-plan should contain:

1. objective;
2. current problem;
3. learning topics;
4. proposed approach;
5. implementation steps;
6. verification checklist;
7. definition of done;
8. deferred items.

The super plan is the source of sequencing and scope. Sub-plans provide execution detail.

## Definition of V1.1 complete

V1.1 is complete when the product is no longer merely technically functional but is coherent as a small real-world beauty parlour product, both for a customer booking an appointment and for the owner managing that appointment.

Only after this point should we decide whether the product is ready to become public and whether production Clerk/custom-domain work should be resumed.
