# Project Docs

| File | Purpose |
|---|---|
| `product.md` | Product vision and roadmap |
| `architecture.md` | Stable technical decisions, platform notes, engineering principles |
| `ideas.md` | Future ideas and possibilities not part of the active plan |
| `plans/` | Detailed implementation plans for active phases/features |

Read `product.md` to understand the product and where it is going. Read `architecture.md` before making significant technical decisions; active work is planned in detail under `plans/`. Detailed plans in `plans/` are disposable — once a plan's work ships and is verified, delete the plan file; the code and git history are the permanent record, not the plan.

## Agent Planning Prompt

Use this prompt when a phase or feature is ready for detailed planning:

```text
Create a detailed implementation plan for [PHASE / FEATURE].

First read the project documentation and inspect the existing codebase. Use
`docs/product.md`, `docs/architecture.md`, and any relevant existing plans
as context.

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

## Core principle

> Build for the real parlor first. Learn from real usage. Add complexity only when it creates value.
