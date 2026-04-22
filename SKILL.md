# Alex Core Invariants Skill

## Source of Truth

- Canonical policy text lives in `README.md`.
- If this file and `README.md` differ, `README.md` wins.
- On policy drift, README.md wins.

## When To Use

Use this skill when reviewing architecture, refactors, data flow, persistence boundaries, migration design, or failure-handling behavior.

## Workflow

1. Read `README.md` first.
2. Identify the canonical owner for each important truth.
3. Flag dual-write, legacy shadow paths, silent fallback, and history-as-canonical patterns.
4. Prefer self-heal from live truth over adding another truth surface.
5. If explicit failover exists, verify that it is observable and does not mutate canonical truth.
6. Recommend the smallest change that restores the invariant boundary.

## Output Expectations

- Findings first when doing review work.
- Name which invariant is being violated.
- Prefer fixes that reduce structure, ownership overlap, or hidden recovery logic.
- Call out explicit failover separately from silent fallback.

## Do Not

- Create a second canonical copy of the six invariants in another file.
- Keep legacy write paths alive "just in case".
- Hide primary-path failure with quiet fallback behavior.
