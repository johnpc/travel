# Travel

**Travel is a guest-first, account-free group-trip planner.** A group of friends (say 4–5 couples)
opens a trip at its own URL — `travel.jpc.io/<trip-name>` — and collaborates there: brainstorm
destinations (AI-suggested and user-added), pull up activity ideas and generated destination imagery,
mark how interested each person is, then work out which dates everyone's free and whether the budget
is feasible. **No sign-up, no accounts** — the URL is the whole identity of a trip, and each person is
known by the name they pick from the roster.

Architecture, quality bar, and toolchain descend from the **spork** app (`~/repo/spork`) — when a
pattern is unclear here, that's the reference implementation.

## How we work together (read this first)

The person directing you may be **non-technical** — an "idea guy" who owns the **product**. They
define **WHAT**: features, intent, and Gherkin acceptance scenarios. **You own the HOW**:
architecture, code quality, testing, and every technical decision below.

- **Never ask them to make a technical call.** Don't surface coverage numbers, CRAP, lint,
  file-length, library choices, or schema design as questions. Decide them yourself, silently.
- **Translate vague ideas into Gherkin.** When they describe a feature, propose concrete `.feature`
  scenarios (Given/When/Then) and confirm those — that's the spec you build to.
- **Only escalate genuine _product_ questions** — ambiguous behavior, scope, copy, what a screen
  should do. Everything technical is yours.

## Workflow: specs-first vertical slices

Every feature ships as one **thin vertical slice** — UI + hook + API + backend model + tests, just
enough for the scenario, nothing speculative.

1. **Spec first.** Write/confirm Gherkin scenarios in `e2e/features/<slice>/*.feature`, steps in
   `e2e/steps/`.
2. **Scaffold backend only as the slice needs it** — add Amplify models + seed in `amplify/` for
   exactly this slice's read patterns; don't model ahead of a UI that uses it.
3. **Implement to pass the spec** — follow the architecture and file conventions below.
4. **Run the full quality gate** (`npm run quality`) and get it green locally.
5. **Deploy + seed** the backend if it changed (`npx ampx sandbox`, `npm run seed`).
6. **Conventional commit, push, CI green.** Open a PR; CI blocks the merge.

### PR titles (what shipped, not the backstory)

The **title** names the feature added, bug fixed, or behavior changed — plainly, as a
conventional-commit line: `type(scope): what changed`. No phase numbers, no issue-number soup —
context and `Closes #N` go in the body.

Good: `feat(destinations): suggest destinations with AI and let anyone add their own` ·
`fix(roster): recognize a returning member across devices`

### PR demo artifacts (screenshot or video of the new feature)

When a PR changes anything a user can **see or interact with**, the PR description MUST include a
screenshot or short video of it working, generated from the slice's own Gherkin test (Playwright
records a `.webm` with `VIDEO=1`; or `page.screenshot`). Skip only for pure backend/refactor/docs.

Upload to `files.jpc.io` and paste the permanent `/d/<name>` URL — it renders inline in the PR body.
A `curl -I` returning a **307** is expected (the server re-signs S3 on each render); the `/d/` link
never expires. All `aws` calls use **`AWS_PROFILE=personal`**; never inline keys.

```bash
FILE_PATH="test-results/<…>/video.webm"   # or a screenshot .png
FILENAME=$(basename "$FILE_PATH")
HASH=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5)
AWS_PROFILE=personal aws s3 cp "$FILE_PATH" \
  "s3://amplify-d1wnjkkkrwiiql-mai-imagehostbucketaac3bfe7-aark0f5h8nw8/public/public/${HASH}-${FILENAME}" \
  --region us-west-2
echo "https://files.jpc.io/d/${HASH}-${FILENAME}"
```

## Stack

- **Client:** Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor (iOS/Android).
- **Backend:** AWS Amplify Gen2 — Cognito + AppSync (GraphQL) + DynamoDB. Lives in `amplify/`.
- **AI (later slices):** Bedrock Claude (tool-forced structured destination/activity suggestions)
  and Bedrock image generation (destination imagery), written to S3 + DynamoDB by Lambdas.

## The core model: guest-first, URL-as-key, name-only identity

Travel has **no accounts**. This is the defining constraint — keep the seam sharp:

- **A trip is addressed by its URL `slug`** (`travel.jpc.io/greece-2027`). Opening a slug that doesn't
  exist yet **creates** the trip (first visit). The slug is the trip's whole identity.
- **Identity is name-only and lives SERVER-SIDE.** Each person is a `Member` row (a name scoped to a
  trip). You "log in" by picking your name from the roster or adding it. The device's localStorage
  only _auto-selects_ your name on return — it is NOT the source of truth, so switching devices never
  loses your identity or your votes; you just re-pick your name. (See `identityStore.ts`.)
- **Trusted-group threat model.** Anyone with the URL can act as anyone on the roster — acceptable for
  a small group of trusted friends, which is the whole audience. Do NOT add auth gates, PINs, or
  accounts unless the product owner explicitly asks; it would break the zero-friction premise.
- **Persistent brainstorm artifacts.** Destinations, activities, and generated imagery are meant to
  be **permanently useful** — never expire or garbage-collect them. Trip-_scheduling_ concerns (dates,
  budget) are separate, per-candidate-trip data layered on top of the durable brainstorm.

## Amplify auth contract (client mode ↔ schema rule MUST match)

A request is authorized only when the **client `authMode`** and the model's **`allow.*` rule** name
the **same provider**. Mismatches return `Unauthorized` / empty results, not a loud error.

- **Collaborative models grant GUEST CRUD** — `allow.guest().to(['read','create','update','delete'])`
  - the two `authenticated` providers + `group('editors')`. This diverges from spork's editor-gated
    content precisely because Travel has no accounts: everyone with the URL is a trusted collaborator.
    **Every new collaborative model MUST keep the guest CRUD grant** or the app breaks for guests.
- The data client (`src/lib/dataClient.ts`) defaults to **`identityPool`** (the guest role), so
  collaboration "just works". `readAuthMode()` upgrades a signed-in visitor to `userPool` — used only
  by the seed/authoring paths, never required for normal use.
- The `editors` Cognito group + a single test user exist ONLY to reuse the proven seed/CI rig (the
  seed signs in as an editor to reset the shared sandbox). They are not a user-facing gate.
- AI-generation mutations (later) are **guest-callable**; the Lambda does the privileged work under
  its own IAM role and writes straight to DynamoDB, bypassing AppSync (mirrors spork).

## Code organization (vertical slices)

Features live under `src/features/<feature>/`; shared primitives under `src/features/shell/` and
`src/lib/`. Tests are colocated. File conventions everywhere:

- **`useX.ts`** — hooks hold all logic/orchestration; client state via Context + Hook + Provider.
- **`xApi.ts`** — all server state through react-query (`useQuery`/`useMutation`) wrapping the Amplify
  client. No server fetches in components.
- **`X.tsx`** — components only render.
- **`x.ts`** helpers — pure functions for non-trivial logic (unit-testable, keeps files short).
- **`X.css`** — consume `--tv-*` design tokens / role classes from `src/theme/variables.css`.

Current slices: `shell` (LoadState / EmptyState / Skeleton), `theme` (light/dark + in-app override),
`identity` (name-only), `home` (start/open a trip), `trip` (the trip page + roster).

## Design

- **Style only via design tokens.** Consume the `--tv-*` CSS variables and role classes
  (`.tv-heading`, `.tv-kicker`, `.tv-muted`, `.tv-serif`) from `src/theme/variables.css` — **never
  hardcoded hex/px** in feature CSS. A warm travel palette: teal accent, terracotta highlights, sandy
  neutrals.
- **Dark mode** follows the OS by default and honors an explicit in-app override (`data-theme` on
  `<html>`, persisted). Both schemes come free from the tokens.
- Every data screen uses the shared **`LoadState`** (loading / retryable-error / empty / ready) — no
  infinite spinners, no silent blanks. Every fetch hook exposes `isError` (+ `refetch`).

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

Run `npm run quality` for the full set. **Enforce them yourself; when one fails, fix the code, never
the gate.** Scope covers `src/` and `amplify/` LOGIC; only declarative files are exempt
(`amplify/**/resource.ts`, `amplify/backend.ts`, `amplify/seed/fixtures/**`).

- **No `any`, ever.** ESLint `@typescript-eslint/no-explicit-any: error`.
- **Every `.ts`/`.tsx` logic file ≤ 100 lines** (`npm run check:lines`). Over → extract a real,
  cohesive helper. Never raise the limit; never game it by deleting comments/blank lines.
- **≥ 80% coverage** on the suite. Fix by writing tests — never exclusions.
- **CRAP ≤ 15 per function** (`npm run crap`).
- **Acceptance tests are always Gherkin** (`.feature` + steps), run via Playwright + playwright-bdd;
  every `.feature` dir maps to a CI matrix area (`npm run check:features`).
- **Build must pass** (`npm run build`). **Format clean** (Prettier).
- **Determinism:** pure helpers take injected randomness/time — no bare `Math.random()`/`Date.now()`
  in logic under test.

### Honest e2e

Every data-reading flow asserts on **rendered real (seeded) data**, not just a URL or element
visibility — e.g. the trip page shows the seeded "Greece 2027" title and its actual roster members,
and joining adds a real Member row read back from the backend.

## Definition of done

A slice is done only when **all** hold:

1. `npm run quality` green locally (husky pre-commit enforces it on commit).
2. Gherkin acceptance scenarios + colocated unit tests added and passing.
3. Backend deployed + seeded if any Amplify model changed (`npx ampx sandbox`, `npm run seed`).
4. Conventional commit, branch pushed, PR open, **CI green**.
5. PR description includes a demo artifact (screenshot/video) for any user-visible change.
6. README updated to match current behavior (feature list, how-it-works, data provenance).

## Commands

```bash
npm run dev            # Vite dev server on :5173
npm run quality        # full local gate: lint + format + check:lines + check:features + coverage + crap + build
npm run format         # Prettier write (run before committing)
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run seed           # reset the shared sandbox to seeded trips (idempotent; needs editor creds)
npm run e2e-config     # pull amplify_outputs.json from the sandbox stack
npx ampx sandbox       # personal cloud backend sandbox
```

## Key facts

- **Repo:** `johnpc/travel`. Web: `travel.jpc.io/<trip-slug>`.
- **iOS/Android bundle id:** `com.johncorser.travel`. Region `us-west-2`, AWS profile `personal`.
- **Sandbox stack:** `amplify-travel-xss-sandbox-d4c65224d6` (wired into `package.json` `e2e-config`).
- **CI:** `.github/workflows/ci.yml` (quality + seed + Gherkin acceptance matrix) blocks PRs.
  `ios-deploy.yml` / `android-deploy.yml` publish after CI on `main`. Secrets: `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `TEST_USERNAME`, `TEST_PASSWORD`, `ASC_KEY_ID`, `ASC_ISSUER_ID`,
  `ASC_KEY_CONTENT`, `TEAM_ID`.

## Conventions

- **Conventional commits** (`feat:`, `fix:`, `chore:`, `ci:`, `docs:` …), 1 commit per package.
- Keep logic out of view components. Throwaway scripts go in `/tmp`, not the repo.

## Decisions

Significant, hard-to-reverse choices are recorded here. Read these before re-opening a settled
question.

- **Account-free, URL-as-key.** A trip is its URL; there is no sign-up. Removes all auth friction for
  the trusted-friends audience. Revisit only if the product owner wants cross-trip accounts.
- **Name-only identity, server-backed.** You're known by a roster name stored in DynamoDB; the device
  only auto-selects it. Chosen over device-only identity so switching devices never loses votes.
- **Guest CRUD on collaborative models.** Everyone with the URL can create/edit/delete trip content
  (vs spork's editor-gated reads). The `editors` group is kept solely to reuse the seed/CI rig.
- **Brainstorm artifacts are permanent.** Destinations/activities/imagery never expire — they're the
  durable value. Scheduling data (dates/budget) is layered separately per candidate trip.
