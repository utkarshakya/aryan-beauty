# Project Docs

These documents describe the product at different levels. Keep them small, current, and useful.

## Documents

| File | Purpose |
|---|---|
| `vision.md` | Why we are building the product and what success means |
| `plan.md` | High-level product plan: what we build and roughly in what order |
| `architecture.md` | Stable technical decisions and engineering principles |
| `ideas.md` | Future ideas and possibilities that are not part of the active plan |
| `plans/` | Detailed implementation plans for individual phases/features |
| `archive/` | Previous documentation kept only for historical reference |

## How to use the docs

1. Read `vision.md` to understand the product.
2. Read `plan.md` to understand where we are going.
3. Read `architecture.md` before making significant technical decisions.
4. When a phase or feature is ready to build, ask the coding agent to create a detailed plan in `plans/`.
5. Implement from that detailed plan, then update the high-level docs when the product or architecture changes.

## Agent Planning Prompt

Use this prompt when a phase or feature is ready for detailed planning:

```text
Create a detailed implementation plan for [PHASE / FEATURE].

First read the project documentation and inspect the existing codebase. Use
`docs/vision.md`, `docs/plan.md`, `docs/architecture.md`, and any relevant
existing plans as context.

Do not implement anything. Create a complete, practical low-level plan that
another agent can follow to implement the work.

Include:
- goals and scope
- assumptions and decisions
- dependencies and prerequisites
- database/schema changes
- backend/API changes
- frontend/UI changes
- authentication/authorization considerations
- files and modules to create or modify
- ordered implementation tasks with enough detail to execute them
- testing and verification
- commands where useful
- edge cases and failure handling
- deployment/configuration considerations where relevant

Inspect the existing code before deciding where changes belong. Reuse the
current architecture and patterns where appropriate. Do not invent future
features outside the requested scope.

If an important decision is unclear, stop and list the decision that needs my
approval instead of silently making a major architectural choice.

Save the finished plan under `docs/plans/` with an appropriate filename.
```

## Planning rule

The high-level plan describes **what** we want to achieve, not every implementation detail.

Detailed plans describe **how** to implement one phase or feature. They are created when needed and may be discarded or replaced after the work is complete.

## Core principle

> Build for the real parlor first. Learn from real usage. Add complexity only when it creates value.
