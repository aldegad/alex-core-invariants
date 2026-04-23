# Alex Core Invariants

This must be obeyed.

`alex-core-invariants` is a small canonical policy repo for AI-assisted engineering. The point is simple: keep the invariant text in one place, link to it from other repos, and avoid letting the policy itself drift.

## The Six Invariants

Every harness eventually splits into two layers: a thin **core** that must survive model swaps and framework churn, and a thin **adapter** that patches whatever this month's model gets wrong. Adapters are disposable. The core is not.

These six are the core. They describe failure modes no adapter can paper over — if you get one wrong, no amount of prompt tuning, retry logic, or model upgrade will save you. The failure is structural.

1. `SSoT (Single Source of Truth)`  
   Every truth the system depends on must have one canonical owner. Two concurrent canonical paths are not allowed. If cache or index state drifts, live truth should repair canonical state instead of creating a second truth.  
   *Two truths stay two truths no matter which model reads them.*

2. `SRP (Single Responsibility Principle)`  
   A module, file, function, or route should have one job.  
   *Mixed responsibility survives every refactor until nothing can be changed without breaking something else.*

3. `Consistency`  
   Data, state, and representation should not contradict each other across the system.  
   *Contradictions don't heal with time. They compound.*

4. `Atomicity`  
   A change should either complete fully or roll back cleanly. Do not expose half-written state.  
   *Half-written state is a second truth no one declared.*

5. `Idempotency`  
   Repeating the same request should converge on the same result.  
   *Without it, retries — the most common recovery tool — become the corruption.*

6. `No Silent Fallback`  
   `fallback`, `legacy`, and `shadow path` patterns are not allowed when they silently hide failure or create a second truth. Explicit failover for availability is allowed, but it must be observable and must not change canonical truth.  
   *A silent fallback is the moment the core stops being the core.*

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
