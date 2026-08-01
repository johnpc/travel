<p align="center">
  <img src="assets/banner.png" alt="Travel — brainstorm destinations, align on activities, dates and budget, and plan group trips together" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/johnpc/travel/actions/workflows/ci.yml"><img src="https://github.com/johnpc/travel/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
</p>

# Travel

**Plan a group trip together — without the group chat chaos.** Name a trip, share the link, and
everyone brainstorms destinations, weighs in on activities, and sorts out dates and budget in one
place. **No sign-up, no accounts** — a trip lives at its own URL (`travel.jpc.io/<trip-name>`), and
you're known by the name you pick. Open the link, add yourself, start planning.

> Built for a small group of trusted friends (say, 4–5 couples) who keep stalling on _where_, _when_,
> _what to do_, and _can we afford it_. Travel turns that scattered back-and-forth into a shared,
> permanent planning space.

## Why

Getting a group aligned on travel is hard in four specific ways, and Travel takes each one on:

1. **Destination preferences** — brainstorm places together; AI suggests destinations (and you can
   add your own), and everyone votes their interest so the group's favorites rise to the top.
2. **Activity preferences** — AI activity ideas at each place (island hopping, the Acropolis…), each
   linking out to real GetYourGuide experiences.
3. **Available dates** — a shared month calendar where everyone marks when they're free.
4. **Budget feasibility** — a rough per-destination estimate (flights, lodging, nights) with
   per-person and per-couple totals.

The brainstorm is a **permanent, reusable artifact** — the destinations and activities you collect
stay useful for this trip and the next.

## Features

| Feature                                                   | Status |
| --------------------------------------------------------- | :----: |
| Open/create a trip by URL — no account                    |   ✅   |
| Name-only roster (pick your name, recognized anywhere)    |   ✅   |
| Light/dark theme (follows OS + in-app override)           |   ✅   |
| Brainstorm destinations (AI-suggested + user-added)       |   ✅   |
| Activity ideas per destination (AI + GetYourGuide links)  |   ✅   |
| Generated destination imagery (AI, persistent)            |   ✅   |
| Per-person interest levels (voting)                       |   ✅   |
| Date availability (shared month calendar)                 |   ✅   |
| Budget estimate per destination (per-person / per-couple) |   ✅   |

## How it works

- **The URL is the trip.** Visiting `travel.jpc.io/greece-2027` opens that trip — or creates it on
  the first visit. Share the link and everyone lands in the same place.
- **You're a name, not an account.** You join a trip's roster by picking (or adding) your name. That
  identity is stored server-side, so switching from your laptop to your phone just means re-picking
  your name — nothing is lost. Your device remembers your choice for next time.
- **Trusted-group model.** Anyone with the link can collaborate as anyone on the roster. That's the
  point — zero friction for a small group of friends. It's not built for adversarial/public use.

## Where the data comes from

- **Collaborative data** (trips, rosters, destinations, activities, interest votes, date availability,
  and budget estimates) lives in **DynamoDB** via AWS Amplify, readable and writable by any guest with
  the trip URL.
- **AI suggestions** (destinations and per-destination activities) are generated with **Amazon
  Bedrock** (Claude, tool-forced structured output) and kept as permanent brainstorm artifacts.
  Activities also link out to a **GetYourGuide** search for real, current experiences. Destination
  **imagery** is generated on demand with Bedrock (Stability), resized to WebP, and stored in S3 —
  a persistent view of what you'd actually see there.

## Install

- **Web:** open `https://travel.jpc.io/<your-trip-name>` in any browser. Add to Home Screen to
  install it as a PWA.
- **iOS / Android:** TestFlight / APK links land here once the first mobile build ships.

## Tech

Ionic 8 + React 19 + TypeScript (strict) · Vite · Capacitor (iOS/Android) · AWS Amplify Gen2 (Cognito

- AppSync + DynamoDB). Guest-first auth, a strict quality gate (no `any`, ≤100 lines/logic file, ≥80%
  coverage, CRAP ≤15), and Gherkin acceptance tests on every data flow. See [`CLAUDE.md`](./CLAUDE.md)
  for the architecture and contribution charter.

## Development

```bash
npm install
npm run e2e-config   # pull amplify_outputs.json from the sandbox
npm run dev          # Vite dev server on http://localhost:5173
npm run quality      # full gate: lint + format + lines + features + coverage + crap + build
npm run test:e2e     # Gherkin acceptance tests (Playwright)
npm run seed         # reset the shared sandbox to demo trips (needs editor creds)
```
