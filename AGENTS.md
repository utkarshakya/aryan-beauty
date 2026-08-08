# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independently managed Node.js applications:

- `client/` is a React 19 + Vite frontend. Pages live in `client/src/pages/`, reusable UI in `client/src/components/`, and Tailwind source/output CSS in `client/src/styles/`.
- `server/` is an ES-module Express API. Keep HTTP routes in `routes/`, request handlers in `controllers/`, MongoDB schemas in `models/`, validation in `validators/`, and shared infrastructure in `config/`, `middlewares/`, and `utils/`.
- `docs/` contains product, architecture, API, deployment, and design documentation. Update relevant docs when behavior or contracts change.

## Build, Test, and Development Commands

Run commands from the relevant package directory:

```powershell
cd client; npm install; npm run dev       # Vite and Tailwind watch mode
cd client; npm run build                  # Production frontend build
cd server; npm install; npm run dev       # API with nodemon
cd server; npm start                      # API without file watching
```

There are currently no repository-level test or lint scripts and no committed test suite. At minimum, run `npm run build` for frontend changes and exercise affected API routes locally for backend changes.

## Coding Style & Naming Conventions

Use two-space indentation and the existing JavaScript style; preserve ES module imports and semicolons. Use PascalCase for React components and page files (`ServicesPreview.jsx`), camelCase for functions and variables, and descriptive suffixes such as `Controller`, `Routes`, `Validator`, and `Model` on server modules. Keep Tailwind edits in `input.css`; treat generated `output.css` as build output unless the project workflow requires committing it.

## Testing Guidelines

When adding tests, place frontend tests near the component/page or in a clearly named test directory, and backend tests under `server/test/` with names such as `appointmentRoutes.test.js`. Add an npm script and document the command when introducing a framework; maintain coverage for new validation, authentication, payment, and appointment paths.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, conventional-style prefixes such as `feat:`, `refactor:`, `chore:`, and `Enhance`. Prefer `type: concise imperative summary`, keep commits focused, and update lockfiles with dependency changes. Pull requests should explain behavior changes, link related issues, list verification commands, note environment/configuration changes, and include screenshots or recordings for UI work.

## Security & Configuration Tips

Do not commit `.env` files or credentials. The server reads `PORT`, `JWT_SECRET`, MongoDB, Redis, Razorpay, SMTP, and Cloudinary settings from environment variables; document new variables and provide safe local examples without real secrets.
