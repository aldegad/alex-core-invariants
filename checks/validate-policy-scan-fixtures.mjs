import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { scanTarget } from "./policy-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, "fixtures", "policy-scan");

const negativeIssues = await scanTarget(path.join(fixtures, "negative"));
assert.deepEqual(negativeIssues, [], "negative policy-scan fixtures should not produce findings");

const positiveIssues = await scanTarget(path.join(fixtures, "positive"));
const positiveRules = new Set(positiveIssues.map((issue) => issue.rule));

for (const expectedRule of ["silent-fallback", "legacy-shadow-path", "dual-write", "catch-return"]) {
  assert(
    positiveRules.has(expectedRule),
    `positive policy-scan fixtures should include ${expectedRule}`
  );
}

console.log("policy-scan fixture check passed.");
