# Admin panel — agent instructions

## What this repo is
Internal operations React app for the business team. Handles:
- Product management (create, edit, stock)
- Customer and order management
- Lead and inquiry tracking
- Investor and investment operations
- Returns and payout tracking
- Role-based access (admin, manager, staff — roles defined in backend)
- Settings and configuration

## Stack
- React (functional components + hooks only)
- Calls backend REST APIs using role-based auth
- Internal use only — not publicly accessible

## Build & test commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` — run before every PR
- Tests: `npm test`

## Code conventions
- Same as global standards plus:
- Every page must check the user's role before rendering sensitive actions
- Role checks are UI-layer only (enforcement is on the backend) — do both
- No hardcoded role strings in components — import from a central `src/constants/roles.js`
- Table/list views must have pagination — never load unbounded lists
- Destructive actions (delete, cancel, mark as returned) must have a confirmation dialog

## Folder structure
- `src/api/` — all backend API call functions, grouped by domain
- `src/pages/` — route-level page components
- `src/components/` — shared UI components
- `src/context/` — admin auth context
- `src/hooks/` — custom hooks
- `src/constants/` — roles, status enums, config

## Security rules
- Admin JWT is separate from customer JWT — never mix them
- Never show internal IDs or raw DB fields in the UI unless explicitly needed
- Log all destructive actions client-side (for audit trail context) and ensure backend logs them too
- Session timeout: redirect to login on 401, do not silently retry with stale tokens

## API integration
- Base URL from environment variable `VITE_API_BASE_URL`
- All requests include admin auth token in Authorization header
- Handle 401 → logout and redirect to login
- Handle 403 → show "not authorized" message (do not redirect to login)
- Handle 5xx → show error with retry option

## PR rules
- PR title: `[FEATURE|FIX|STYLE|REFACTOR] Short description`
- For any role/permission change: describe which roles are affected
- Must pass lint and tests before merge