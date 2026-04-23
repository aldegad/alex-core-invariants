**Languages**: English · [한국어](README.ko.md)

# Alex's Six Invariants

This must be obeyed.

> Even when the model swaps, even when the framework is rewritten, even when you throw the tuning adapter away — six invariants do not move.
>
> SSoT · SRP · Consistency · Atomicity · Idempotency · No Silent Fallback
>
> Every harness splits into a thin **core** and a thin **adapter**. Adapters are disposable. The core is not. This repo is about the core only — the structural failures no adapter can paper over.

## The Six Invariants

1. `SSoT (Single Source of Truth)` — **Two truths stay two truths, no matter which model reads them.**  
   Every truth the system depends on must have one canonical owner. Two concurrent canonical paths are not allowed. If cache or index state drifts, live truth should repair canonical state instead of creating a second truth.

2. `SRP (Single Responsibility Principle)` — **Mixed responsibility survives every refactor until nothing can be changed without breaking something else.**  
   A module, file, function, or route should have one job.

3. `Consistency` — **Contradictions don't heal with time. They compound.**  
   Data, state, and representation should not contradict each other across the system.

4. `Atomicity` — **Half-written state is a second truth no one declared.**  
   A change should either complete fully or roll back cleanly. Do not expose half-written state.

5. `Idempotency` — **Without idempotency, retries become corruption instead of recovery.**  
   Repeating the same request should converge on the same result.

6. `No Silent Fallback` — **A silent fallback is the moment the core stops being the core.**  
   `fallback`, `legacy`, and `shadow path` patterns are not allowed when they silently hide failure or create a second truth. Explicit failover for availability is allowed, but it must be observable and must not change canonical truth.

## Why these six

Each invariant names a failure mode the adapter cannot route around. Cache drift, mixed responsibility, half-written state — get one wrong and no amount of prompt tuning, retry logic, or model upgrade will save you. The failure is structural.

The core/adapter split is also what makes aggressive adapter work safe. You can tune the adapter hard for this month's model precisely because the core underneath does not move. Invert the assumption — let the core drift to accommodate model quirks — and the adapter loses its anchor. The harness starts absorbing problems it was supposed to route around.

Every debate about longevity ("build for next year's model") versus efficiency ("squeeze this month's model dry") dissolves under this split. Longevity lives in the core. Efficiency lives in the adapter. Forcing one layer to do both jobs is how harnesses rot.

## About this repo

`alex-core-invariants` is a small canonical policy repo for AI-assisted engineering. The point is simple: keep the invariant text in one place, link to it from other repos, and avoid letting the policy itself drift.

## Repo Layout

- `README.md`: canonical policy text (single source of truth)
- `README.ko.md`: Korean translation — derived artifact, never the canonical source
- `SKILL.md`: lightweight agent workflow that defers to `README.md`
- `checks/`: small verification scripts
- `scripts/`: helper scripts (translation stamping)
- `.githooks/`: repo-local git hooks (opt-in via `npm run setup`)
- `examples/AGENTS.md`: drop-in usage example for other repos

## Usage

Keep the policy text linked, not copied, wherever possible.

```bash
npm run check
node checks/policy-scan.mjs ../some-repo
```

`npm run check` validates this repo itself, including the Korean translation's sync state. `policy-scan` is a lightweight heuristic scan for likely invariant violations in another codebase; it is meant to surface review candidates, not replace engineering judgment.

One-time setup to enable the pre-commit hook:

```bash
npm run setup
```

When you edit `README.md`, update `README.ko.md` to match (manually, or via any LLM) and then run:

```bash
npm run translate
```

This restamps `README.ko.md` with the current `README.md` source-sha. The pre-commit hook blocks commits where the two are out of sync.

## Design Notes

- `README.md` is the only canonical policy definition in this repo.
- `README.ko.md` is a derived artifact, not a second source. A `source-sha` header pins it to a specific `README.md` revision; the pre-commit hook blocks drift. This preserves the SSoT invariant for the policy text itself.
- `SKILL.md` should guide behavior, not become a second full copy of the policy.
- Checks should stay shallow and opinionated. This repo is not a framework.

## License

MIT
