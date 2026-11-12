# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route components responsible for presenting data and loading, empty, and error states. Fetch through the shared API client and keep API paths relative so Vite's `/api` proxy remains the browser's entry point.
- Logic tier decision: Keep route handlers thin; put request validation and capability behavior in the backend service layer. Return deliberate 4xx responses for invalid or unknown resources rather than leaking database cast errors as 500s.
- Data tier decision: Enforce required fields and references in Mongoose models. Keep seeding idempotent and preserve unrelated existing records while maintaining the seeded users' team memberships.
- Activity tracking approach: Require a valid activity type, positive minutes, and well-formed IDs for an existing user and team. Store the submitted references and values, use one point per minute as the deterministic scoring rule, and set `occurredAt` when the activity is created.
- Team management approach: Require a non-empty name and mascot; default omitted members to an empty list and validate supplied member IDs against existing users. Preserve the submitted team name, mascot, and members in create and list responses.
- Leaderboard approach: Sum activity points by team, include teams with no activity at zero points, sort by total descending with team name as a deterministic tie-breaker, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email and prioritize workouts matching their fitness goal, then recent activity patterns. Include a short reason tied to the matching goal or activity, and return 404 when no user matches.

## Test plan

Record the commands you run and what each failure means.

- `npm run test:data --prefix octofit-tracker/backend` — checks model validation and idempotent, non-destructive seeding; failures indicate a data contract or seed regression.
- `npm run test:api --prefix octofit-tracker/backend` — checks request validation, persistence, leaderboard ordering, and recommendations; failures indicate service behavior, response shape, or status-code mismatches.
- `npm test --prefix octofit-tracker/frontend` — checks API-backed rendering and loading, empty, and error states; failures indicate a presentation or shared-client integration issue.
- `npm run build --prefix octofit-tracker/backend` — type-checks the backend; failures indicate TypeScript errors in backend code.
- `npm run build --prefix octofit-tracker/frontend` — type-checks and builds the Vite app; failures indicate frontend type or production-build errors.

Pre-implementation baseline: the data contract had 4 failures (required-field validation), the API contract had 4 failures (two unimplemented validation paths, empty leaderboard, and mismatched suggestion), and the frontend contract had 15 failures (routes still showed the pending placeholder instead of API data and request states). Re-run the focused tests after each tier change, then run both builds.
