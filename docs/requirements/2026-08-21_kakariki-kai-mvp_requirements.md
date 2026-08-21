# Kākāriki Kai Priority 1 MVP Requirements

| Field | Value |
|---|---|
| Date | 2026-08-21 |
| Status | In delivery |
| Owner | Manus AI |
| Source request | Kākāriki Kai Priority 1 user stories and supplied Kākāriki House design system |

## Goal

Deliver a deployable, front-end test workspace in which kaimahi can see and book a weekly menu, and a KaiChef can define meals, arrange the weekly schedule, inspect daily totals, print a pickup list and review the weekly email before sending. Success means every Priority 1 user journey can be exercised on a deployed browser build without developer tooling, while production-only services remain clearly separated and documented.

## Confirmed Context

| Area | Confirmed direction |
|---|---|
| App target | React 19, Vite 7, TypeScript, Tailwind v4, shadcn primitives in a Kākāriki House service-hub shell. |
| Production profile | WMS Infrastructure-Abstracted Standard. Azure SQL and a .NET 10 Clean Architecture core become authoritative when infrastructure access is ready. |
| POC persistence | Browser `localStorage`, seeded with transparent test data. No shared operational or personal data is stored. |
| Roles | Any signed-in kaimahi books their own meals. `KaiChef` manages meals, menu days, prices, daily booking lists, print sheet and email review. |
| Price rule | A menu day defaults to $5.00. A zero price must display as `FREE` everywhere. |
| Scope guards | No in-app cancellation, ingredients, image management, digital collection signing, group bookings, or real email dispatch. |

## Scope and Non-Goals

The MVP includes a whole-week booking screen, individual dietary requests, duplicate-booking prevention in the local adapter, meal and menu editing, staff-visible meal descriptions, chef totals, A4 print styling, and a reviewed email preview. It intentionally does not claim genuine authentication or enforce access beyond the client demonstration mode. The future production API must enforce permissions and tenant scope independently of the browser.

## Dependency Order

| Order | Task | Depends on | Parallelization | Exclusive file ownership |
|---:|---|---|---|---|
| 1 | KKAI-01: Establish visual shell and domain adapter | None | Sequential | `client/src/index.css`, `client/src/App.tsx`, `client/src/lib/*` |
| 2 | KKAI-02: Build kaimahi weekly booking experience | KKAI-01 | Sequential | `client/src/pages/Home.tsx`, `client/src/components/*` |
| 3 | KKAI-03: Build KaiChef menu and operational workspace | KKAI-01 | Sequential | `client/src/pages/Home.tsx`, `client/src/components/*` |
| 4 | KKAI-04: Add printable sheet and email-review flows | KKAI-02, KKAI-03 | Sequential | `client/src/pages/Home.tsx`, `client/src/index.css` |
| 5 | KKAI-05: Validate, deploy, and publish release record | KKAI-04 | Sequential | `docs/runbooks/*`, `README.md`, `CHANGES.md`, `.github/*` |

## Tasks

### KKAI-01 — Establish visual shell and domain adapter

| Field | Detail |
|---|---|
| Execution order | 1; no predecessor |
| Parallelization | Sequential; owns shared styling and local data contracts |
| Scope | Kākāriki House tokens, responsive rail shell, typed `Meal`, `MenuDay`, `Booking`, `DietaryOption` and local persistence boundary |
| Checkpoint | `feat(shell): establish kai workspace foundation` |

#### Full Prompt

Implement the supplied Kākāriki House visual system in the React scaffold, using Outfit, Karla and IBM Plex Mono; off-white page surfaces; white bordered cards; a charcoal rail; olive selected states; and a one-per-screen kōwhai accent. Build explicit typed local POC data structures and a single local adapter for persisted test state. Do not introduce a real API, secret, client-supplied tenant identifier or production permission claim. Validate type checking and production build.

#### Acceptance Criteria

1. The application has a responsive navigation shell that preserves core work access on a phone.
2. POC state is readable and writable through one clear local adapter rather than scattered direct storage calls.
3. The style system follows the supplied brand tokens and supports keyboard focus states.

### KKAI-02 — Build kaimahi weekly booking experience

| Field | Detail |
|---|---|
| Execution order | 2; after KKAI-01 |
| Parallelization | Sequential; shares the menu adapter and main workspace |
| Scope | Weekly menu, day selection, dietary option controls, booking summary and submit feedback |
| Checkpoint | `feat(bookings): add weekly kai booking journey` |

#### Full Prompt

Create the kaimahi flow that presents published menu days in date order, exposes meal name, description, dietary choices and `$5.00` or `FREE`, and lets the person book the whole available week in one submit. Ensure a person can only hold one booking per menu day in the local POC. Clearly explain that cancellations remain through the existing coordinator process. Validate the desktop and small-screen journeys.

#### Acceptance Criteria

1. A tester can select multiple days and submit one weekly booking.
2. Dietary options offered on the day can be selected; unavailable requests are not offered.
3. Confirmed bookings visibly update without a page reload and persist in the current browser.

### KKAI-03 — Build KaiChef menu and operational workspace

| Field | Detail |
|---|---|
| Execution order | 3; after KKAI-01 |
| Parallelization | Sequential; shares the main workspace |
| Scope | Chef role demo switch, meal creation, dietary availability, day assignment, editable price, daily bookings and totals |
| Checkpoint | `feat(chef): add menu and daily service workspace` |

#### Full Prompt

Build the chef-only POC views, guarded by a visible test-role switch. A KaiChef must be able to add or change a meal name and description, configure dietary items as meets by default, available on request or not possible, assign one meal or none per service day, and set a price that becomes `FREE` at zero. The daily list must show date, meal, total bookings and dietary totals. Explain that actual authorisation moves server-side once Kinde and the API are configured.

#### Acceptance Criteria

1. Non-chef test mode does not expose operational controls.
2. Chef test mode can edit a day after test bookings exist and the staff screen updates accordingly.
3. Price formatting remains consistent across menu and bookings list.

### KKAI-04 — Add printable sheet and email-review flows

| Field | Detail |
|---|---|
| Execution order | 4; after KKAI-02 and KKAI-03 |
| Parallelization | Sequential; owns browser print CSS and email preview modal |
| Scope | A4 print layout, alphabetical booking list, signature lines, email review with explicit send simulation |
| Checkpoint | `feat(operations): add print and email review workflows` |

#### Full Prompt

Create a print-ready daily pickup sheet that keeps the day, date and meal name visible; sorts booking names alphabetically; provides a physical signature line; and allows multiple pages through normal browser flow. Add a chef email review that uses the exact subject `Kākāriki Kai - next week's menu.`, presents meal information in date order, and requires a visible final send action. In POC mode, mark delivery as simulated and do not send email.

#### Acceptance Criteria

1. A print preview is readable in A4 layout with a signature column.
2. The email cannot show a success state before the chef triggers the final action.
3. Free days use `FREE` in print and email content.

### KKAI-05 — Validate, deploy, and publish release record

| Field | Detail |
|---|---|
| Execution order | 5; after KKAI-04 |
| Parallelization | Sequential; owns release documentation and deployment verification |
| Scope | Static checks, browser evidence, GitHub push, deployed smoke test, release handoff |
| Checkpoint | `chore(release): publish kai MVP test workspace` |

#### Full Prompt

Run the production build, TypeScript checks and focused business-rule tests. Capture the user-facing weekly booking, chef-only controls, print preview and email review evidence. Push the exact tested source revision to `piricash/k-kai-L1`, deploy the static POC, smoke-test its URL, and document both the outcome and the Azure/Kinde/SendGrid setup required to replace POC adapters. Do not claim production authentication, data persistence or email delivery without their provider-backed checks.

#### Acceptance Criteria

1. A deployed URL serves the application and passes a browser smoke test.
2. The remote repository contains the tested revision, documentation and no secrets.
3. The handoff clearly distinguishes delivered POC behavior from manual production setup.

## Decisions and Assumptions

| Item | Status | Rationale or question |
|---|---|---|
| Immediate deployment | Confirmed | User authorised autonomous deployment and front-end testing. |
| POC data | Confirmed | Browser-local only until a WMS .NET / Azure SQL core is configured. |
| Test identity | Confirmed | A labelled role switch demonstrates kaimahi and KaiChef user journeys; it is not production authorisation. |
| Real email | Deferred | A final send interaction is testable now; provider delivery waits for approved credentials and domain configuration. |
| Tenanting | Deferred to backend | The expected production tenant comes from verified Kinde organisation membership, never client input. |

## Completion Standard

Each task updates `todo.md` and `CHANGES.md`, passes its focused verification, and is committed as a coherent change. The deployed POC must be unambiguously labelled and the production replacement checklist must be current.
