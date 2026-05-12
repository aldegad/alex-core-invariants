---
name: alex-core-invariants
description: "Use when reviewing architecture, refactors, state/data ownership, failure handling, debug discipline, work-in-progress hygiene, or policy drift against Alex's seven invariants: SSoT, SoC/SRP, consistency, atomicity, idempotency, no silent fallback, and doc-first & plan-first."
---

# Alex Core Invariants Skill

## Source of Truth

- Canonical policy text lives in `README.md`.
- If this file and `README.md` differ, `README.md` wins.
- On policy drift, README.md wins.

## When To Use

Use this skill when reviewing architecture, refactors, data flow, persistence boundaries, migration design, failure-handling behavior, or debug discipline (especially when a problem lives in a standardized infra/spec domain — Cloudflare, HTTP, OAuth, browser APIs, AWS/GCP, Kubernetes, build toolchains).

## Workflow

1. Read `README.md` first.
2. Identify the canonical owner for each important truth.
3. Flag dual-write, legacy shadow paths, silent fallback, and history-as-canonical patterns.
4. Prefer self-heal from live truth over adding another truth surface.
5. If explicit failover exists, verify that it is observable and does not mutate canonical truth.
6. For problems in a standardized domain, search the official documentation before dispatching hypotheses.
7. Recommend the smallest change that restores the invariant boundary.

## Output Expectations

- Findings first when doing review work.
- Name which invariant is being violated.
- Prefer fixes that reduce structure, ownership overlap, or hidden recovery logic.
- Call out explicit failover separately from silent fallback.
- For doc-first violations, cite the exact docs page that already had the answer.

## Do Not

- Create a second canonical copy of the seven invariants in another file.
- Keep legacy write paths alive "just in case".
- Hide primary-path failure with quiet fallback behavior.
- Burn cycles dispatching guesses on a problem the official docs already solved.
