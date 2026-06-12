import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readme = await fs.readFile(path.join(root, "README.md"), "utf8");

const requiredPatterns = [
  /<img src="assets\/alex-core-invariants\.png" alt="Alex Core Invariants" width="520">/u,
  /<strong>v2\.1\.0<\/strong> · Eight fixed invariants for AI-assisted engineering/u,
  /^# Alex's Eight Invariants$/m,
  /^This must be obeyed\.$/m,
  /^1\. `SSoT \(Single Source of Truth\)`/m,
  /^2\. `SoC \/ SRP \(Separation of Concerns \/ Single Responsibility\)`/m,
  /^3\. `Consistency`/m,
  /^4\. `Atomicity`/m,
  /^5\. `Idempotency`/m,
  /^6\. `No Silent Fallback`/m,
  /^7\. `Doc-first & Plan-first`/m,
  /^8\. `Isolation`/m
];

const missing = requiredPatterns.filter((pattern) => !pattern.test(readme));

if (missing.length > 0) {
  console.error("README.md is missing one or more canonical invariant markers.");
  process.exit(1);
}

const numberedCount = [...readme.matchAll(/^\d+\.\s/mg)].length;
if (numberedCount !== 8) {
  console.error(`README.md should expose exactly 8 numbered invariants, found ${numberedCount}.`);
  process.exit(1);
}

const forbiddenPatterns = [
  /S(?:ix) invariants govern/u,
  /s(?:ix) invariants/u,
  new RegExp("cond" + "itional " + "dura" + "bility", "u"),
  new RegExp("Cond" + "itional " + "Add-on", "u"),
  /The database engine handles two requests at once/u
];

const forbidden = forbiddenPatterns.filter((pattern) => pattern.test(readme));
if (forbidden.length > 0) {
  console.error("README.md contains stale invariant framing.");
  process.exit(1);
}

if (!/Concurrency is a design surface, not a backend detail\./u.test(readme)) {
  console.error("README.md Isolation invariant should be framed around shared-state concurrency, not only databases.");
  process.exit(1);
}

console.log("README.md canonical invariant check passed.");
