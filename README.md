**Languages**: English · [한국어](README.ko.md)

# Alex's Eight Invariants

This must be obeyed.

> A good harness does not worship the model. It observes failure, swaps the adapter, preserves the core's truth.
>
> The model changes. The adapter is thrown away. The core remains. That core holds invariants that do not move — not through a model swap, not through a framework rewrite, not through an adapter you ship and throw away.
>
> SSoT · SoC/SRP · Consistency · Atomicity · Idempotency · No Silent Fallback · Doc-first & Plan-first · Isolation
>
> Six invariants govern the system you ship. The seventh governs the engineer (human or agent) shipping it — what they read and what they write down before work begins. The eighth governs what happens when two requests race past the first seven at the same instant.
>
> This repo is about that core only — the structural failures no adapter can paper over.

## The Eight Invariants

1. `SSoT (Single Source of Truth)` — **Two truths stay two truths, no matter which model reads them.**  
   Every truth the system depends on must have one canonical owner. Two concurrent canonical paths are not allowed. If cache or index state drifts, live truth should repair canonical state instead of creating a second truth.

2. `SoC / SRP (Separation of Concerns / Single Responsibility)` — **Mixed responsibility survives every refactor until nothing can be changed without breaking something else.**  
   Different concerns belong in separate boundaries — architecture and domain level (SoC), module, file, and function level (SRP). When one boundary carries two concerns, split it.

3. `Consistency` — **Contradictions don't heal with time. They compound.**  
   Data, state, and representation should not contradict each other across the system.

4. `Atomicity` — **Half-written state is a second truth no one declared.**  
   A change should either complete fully or roll back cleanly. Do not expose half-written state.

5. `Idempotency` — **Without idempotency, retries become corruption instead of recovery.**  
   Repeating the same request should converge on the same result.

6. `No Silent Fallback` — **A silent fallback is the moment the core stops being the core.**  
   `fallback`, `legacy`, and `shadow path` patterns are not allowed when they silently hide failure or create a second truth. Explicit failover for availability is allowed, but it must be observable and must not change canonical truth.

7. `Doc-first & Plan-first` — **The hour you spend guessing is the minute you refused to read. The week you spend rebuilding is the half-hour you refused to plan.**  
   Two things come before the work, not after. (a) **Doc-first**: standardized domains (Cloudflare, HTTP encoding, OAuth, browser APIs, AWS/GCP, Kubernetes, build toolchains, etc.) have answers that already live inside one page of official documentation. On a problem in such a domain, the first action is searching the official docs, not dispatching a hypothesis to a worker (or a human). Hypothesis-first work is justified only when the question lives in our own code, our domain rules, or an edge the docs do not cover. (b) **Plan-first**: any non-trivial work goes into a written plan before the first commit. The plan's phases are what trigger doc-first at the right entry points, what give a sequence to recover when something breaks, and what stop ad-hoc fix → commit → deploy spirals. Skipping the plan is justified only on truly trivial one-step work. Twenty years of human engineering — and now AI agents — keep losing one to three hours per problem to the same two skipped steps: Stack Overflow first, docs never; ad-hoc fix first, plan never. This invariant exists because that pattern is structural, not personal.

8. `Isolation` — **The database engine handles two requests at once. It does not handle your read-modify-write.**  
   Application-level concurrency must be made explicit. The DB engine's default isolation (e.g. Postgres `READ COMMITTED`) is not enough on its own. Read-modify-write counters, limit-check-then-insert, chained writes across rows, hash chains keyed on "the latest row," and shared in-memory caches across worker processes all need a *named* strategy: atomic SQL update (`UPDATE ... SET col = col + 1`), `SELECT ... FOR UPDATE`, advisory lock, `SERIALIZABLE` transaction, or an external coordinator. "The framework handles it" is not a strategy. Skipping this invariant is the failure mode that AI review keeps missing because the model assumes the engine's default is the policy.

## Why these eight

Each invariant names a failure mode the adapter cannot route around. Cache drift, mixed responsibility, half-written state, time burned on guess work, two requests racing past the framework's defaults — get one wrong and no amount of prompt tuning, retry logic, or model upgrade will save you. The failure is structural.

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
