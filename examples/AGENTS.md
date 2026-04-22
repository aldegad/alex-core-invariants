# Policy Reference

- Use [Alex Core Invariants](https://github.com/aldegad/alex-core-invariants) as the canonical policy reference.
- Keep the invariant text linked instead of copied wherever possible.
- Flag silent fallback, dual-write, legacy shadow paths, and broken ownership boundaries before implementation.
- Explicit failover is allowed only when it is observable and does not mutate canonical truth.
