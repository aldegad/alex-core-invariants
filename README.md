# Alex Core Invariants

This must be obeyed.

`alex-core-invariants` is a small canonical policy repo for AI-assisted engineering. The point is simple: keep the invariant text in one place, link to it from other repos, and avoid letting the policy itself drift.

## The Six Invariants

1. `SSoT (Single Source of Truth)`  
   Every truth the system depends on must have one canonical owner. Two concurrent canonical paths are not allowed. If cache or index state drifts, live truth should repair canonical state instead of creating a second truth.

2. `SRP (Single Responsibility Principle)`  
   A module, file, function, or route should have one job.

3. `Consistency`  
   Data, state, and representation should not contradict each other across the system.

4. `Atomicity`  
   A change should either complete fully or roll back cleanly. Do not expose half-written state.

5. `Idempotency`  
   Repeating the same request should converge on the same result.

6. `No Silent Fallback`  
   `fallback`, `legacy`, and `shadow path` patterns are not allowed when they silently hide failure or create a second truth. Explicit failover for availability is allowed, but it must be observable and must not change canonical truth.

## Repo Layout

- `README.md`: canonical policy text
- `SKILL.md`: lightweight agent workflow that defers to `README.md`
- `checks/`: small verification scripts
- `examples/AGENTS.md`: drop-in usage example for other repos

## Usage

Keep the policy text linked, not copied, wherever possible.

```bash
npm run check
node checks/policy-scan.mjs ../some-repo
```

`npm run check` validates this repo itself. `policy-scan` is a lightweight heuristic scan for likely invariant violations in another codebase; it is meant to surface review candidates, not replace engineering judgment.

## Design Notes

- `README.md` is the only canonical policy definition in this repo.
- `SKILL.md` should guide behavior, not become a second full copy of the policy.
- Checks should stay shallow and opinionated. This repo is not a framework.

## License

MIT
