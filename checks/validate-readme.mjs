import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readme = await fs.readFile(path.join(root, "README.md"), "utf8");

const requiredPatterns = [
  /^# Alex's Six Invariants$/m,
  /^This must be obeyed\.$/m,
  /^1\. `SSoT \(Single Source of Truth\)`/m,
  /^2\. `SoC \/ SRP \(Separation of Concerns \/ Single Responsibility\)`/m,
  /^3\. `Consistency`/m,
  /^4\. `Atomicity`/m,
  /^5\. `Idempotency`/m,
  /^6\. `No Silent Fallback`/m
];

const missing = requiredPatterns.filter((pattern) => !pattern.test(readme));

if (missing.length > 0) {
  console.error("README.md is missing one or more canonical invariant markers.");
  process.exit(1);
}

const numberedCount = [...readme.matchAll(/^\d+\.\s/mg)].length;
if (numberedCount !== 6) {
  console.error(`README.md should expose exactly 6 numbered invariants, found ${numberedCount}.`);
  process.exit(1);
}

console.log("README.md canonical invariant check passed.");
